import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { productAPI } from "../services/api";
import { FiSearch } from "react-icons/fi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { FavoritesContext } from "../context/FavoritesContext";
import "./compare.css";

const Compare = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestStore, setNearestStore] = useState(null);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [googleSearchLink, setGoogleSearchLink] = useState("");
  const [mapError, setMapError] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const token = localStorage.getItem("token");
  const mapRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const { fetchFavoritesCount } = useContext(FavoritesContext);

  // ============================
  // GET USER LOCATION
  // ============================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  // ============================
  // ADD TO WISHLIST
  // ============================
  const handleAddToWishlist = async (productId) => {
    try {
      await axios.post(
        "https://product-service-3lsh.onrender.com/wishlist",
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        title: "✅ Added to wishlist!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchFavoritesCount();
    } catch (err) {
      console.error("❌ Wishlist error:", err.response?.data || err);

      if (err.response && err.response.data?.message) {
        Swal.fire({
          title: "⚠️ Already added",
          text: err.response.data.message,
          icon: "info",
        });
      } else {
        Swal.fire({
          title: "❌ Error",
          text: "Failed to add to wishlist.",
          icon: "error",
        });
      }
    }
  };

  // ============================
  // FETCH SUGGESTIONS
  // ============================
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setResult(null);
        setMatches([]);
        return;
      }

      try {
        const res = await productAPI.get(`/names/${encodeURIComponent(query)}`);
        setSuggestions(res.data);
        setHighlightIndex(-1);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [query]);

  // ============================
  // SEARCH HANDLER
  // ============================
  const handleSearch = async () => {
    if (!query.trim()) return;

    const isExact = suggestions.includes(query.trim());

    if (isExact) {
      try {
        const res = await productAPI.get(`/compare/${encodeURIComponent(query)}`);
        setResult(res.data);
        setMatches([]);
        setError("");
      } catch (err) {
        console.error("Compare error:", err);
        setResult(null);
        setError("Product not found or error fetching data.");
      }
    } else {
      try {
        const res = await productAPI.get(`/names/${encodeURIComponent(query)}`);
        setMatches(res.data);
        setResult(null);
        setError("");
      } catch (err) {
        console.error("Prefix match error:", err);
        setMatches([]);
        setError("No matching products found.");
      }
    }
  };

  // ============================
  // SELECT PRODUCT
  // ============================
  const handleSelectProduct = async (name) => {
    try {
      setMapError("");
      setMapLoading(true);
      setGoogleMapsLink("");
      setGoogleSearchLink("");
    } catch {}

    try {
      const res = await productAPI.get(`/compare/${encodeURIComponent(name)}`);
      setResult(res.data);
      setMatches([]);
      setQuery(name);
      setSuggestions([]);
      setError("");

      if (!userLocation) {
        setShowLocationPrompt(true);
      } else {
        setShowLocationPrompt(false);
      }
    } catch (err) {
      console.error("Compare select error:", err);
      setResult(null);
      setError("Product not found or error fetching data.");
    } finally {
      setMapLoading(false);
    }
  };

  // ============================
  // GEOCODE ADDRESS
  // ============================
  const geocodeAddress = async (address) => {
    setAddressError("");

    try {
      const q = encodeURIComponent(address);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setUserLocation({ lat, lng: lon });
        setShowLocationPrompt(false);
        return true;
      }

      setAddressError("Address not found. Try a different query.");
      return false;
    } catch (err) {
      console.error("Geocode error:", err);
      setAddressError("Unable to resolve address. Try again later.");
      return false;
    }
  };

  // ============================
  // USE BROWSER LOCATION
  // ============================
  const handleUseGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowLocationPrompt(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setAddressError("Geolocation failed or denied. Enter address instead.");
        }
      );
    } else {
      setAddressError("Geolocation is not supported by your browser.");
    }
  };

  // ============================
  // KEYBOARD NAVIGATION
  // ============================
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = (prev + 1) % suggestions.length;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = (prev - 1 + suggestions.length) % suggestions.length;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0) {
        handleSelectProduct(suggestions[highlightIndex]);
      } else {
        handleSearch();
      }
    }
  };

  const scrollIntoView = (index) => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;
    const item = dropdown.querySelectorAll(".suggestion")[index];
    if (item) item.scrollIntoView({ block: "nearest" });
  };

  // ============================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ============================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ============================
  // MAP LOGIC
  // ============================
  useEffect(() => {
    if (!result || !mapRef.current) return;

    const map = L.map(mapRef.current);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const storeName = result.cheapest.supermarket;
    const q = encodeURIComponent(storeName);

    const addStoreMarker = ({ lat, lon, display_name }) => {
      const storeLat = parseFloat(lat);
      const storeLon = parseFloat(lon);

      L.marker([storeLat, storeLon], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
          iconSize: [35, 35],
        }),
      })
        .addTo(map)
        .bindPopup(`${storeName} ✅ Cheapest store`)
        .openPopup();

      if (userLocation) {
        L.marker([userLocation.lat, userLocation.lng], {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
            iconSize: [35, 35],
          }),
        })
          .addTo(map)
          .bindPopup("You are here");

        setGoogleMapsLink(
          `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${storeLat},${storeLon}`
        );

        map.fitBounds(
          [
            [userLocation.lat, userLocation.lng],
            [storeLat, storeLon],
          ],
          { padding: [50, 50] }
        );
      } else {
        map.setView([storeLat, storeLon], 15);

        setGoogleMapsLink(
          `https://www.google.com/maps/search/?api=1&query=${storeLat},${storeLon}`
        );
      }

      setNearestStore({
        lat: storeLat,
        lon: storeLon,
        name: display_name || storeName,
      });
    };

    if (userLocation) {
      const viewbox = `${userLocation.lng - 0.05},${userLocation.lat + 0.05},${userLocation.lng + 0.05},${userLocation.lat - 0.05}`;

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&viewbox=${viewbox}&bounded=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            addStoreMarker(data[0]);
          } else {
            return fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`
            )
              .then((r) => r.json())
              .then((fallback) => {
                if (fallback.length > 0) addStoreMarker(fallback[0]);
              });
          }
        })
        .catch((err) => console.error("Nominatim error (bounded):", err));
    } else {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            addStoreMarker(data[0]);
          }
        })
        .catch((err) => console.error("Nominatim error (global):", err));
    }

    return () => map.remove();
  }, [result, userLocation]);

  // ============================
  // RENDER
  // ============================
  return (
    <div className="compare-container">
      <h2 className="compare-heading">🔍 <span>Compare Product Prices</span></h2>

      {/* SEARCH BOX */}
      <div className="search-box" ref={dropdownRef}>
        <div className="input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            ref={inputRef}
            placeholder="Start typing a product name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
        </div>

        {/* SUGGESTIONS */}
        {suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((name, i) => (
              <li
                key={i}
                className={`suggestion ${highlightIndex === i ? "active" : ""}`}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => handleSelectProduct(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}

        {/* LOCATION PROMPT */}
        {showLocationPrompt && (
          <div className="location-prompt">
            <h4 className="location-prompt-title">Where are you located?</h4>
            <p className="location-prompt-text">
              Allow the browser to detect your location or enter an address/place.
            </p>

            <div className="location-controls">
              <button onClick={handleUseGeolocation} className="location-button-primary">
                Use my current location
              </button>

              <input
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter address or city"
                className="location-input"
              />

              <button
                onClick={async () => {
                  if (manualAddress.trim()) await geocodeAddress(manualAddress);
                }}
                className="location-button-secondary"
              >
                Search
              </button>
            </div>

            {addressError && <p className="location-error">{addressError}</p>}
          </div>
        )}

        <button onClick={handleSearch} className="compare-button">
          Compare
        </button>
      </div>

      {/* ERROR */}
      {error && <p className="error-text">{error}</p>}

      {/* DID YOU MEAN */}
      {matches && matches.length > 0 && (
        <div className="did-you-mean">
          <h4>Did you mean:</h4>
          <div className="did-you-mean-buttons">
            {matches.map((m, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectProduct(m)}
                className="did-you-mean-button"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="result-box">
          <h3 className="result-title">
            Results for: <strong>{result.product}</strong>
          </h3>

          <div className="result-grid">
            {result.supermarkets.map((p, i) => {
              const isBest =
                p.supermarket === result.cheapest.supermarket &&
                p.price === result.cheapest.price;

              return (
                <div key={i} className={`result-card ${isBest ? "best" : ""}`}>
                  <div className="result-supermarket">{p.supermarket}</div>

                  <div className="result-price-row">
                    <div>
                      <div className="result-price">{p.price.toFixed(2)} €</div>
                      {isBest && <div className="best-badge">✅ Cheapest</div>}
                    </div>

                    {isBest && (
                      <button
                        onClick={() => handleAddToWishlist(p.id)}
                        className="wishlist-btn"
                      >
                        ❤️ Wishlist
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="cheapest">
            ✅ Cheapest: <strong>{result.cheapest.supermarket}</strong> at{" "}
            <strong>{result.cheapest.price.toFixed(2)} €</strong>
          </p>

          {/* MAP */}
          <div className="map-section">
            {mapLoading && (
              <p className="map-loading">Loading map for the cheapest store…</p>
            )}

            <div id="map" ref={mapRef}></div>

            {googleMapsLink && (
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="google-link"
              >
                Go to Google Maps 🚀
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
