import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { productAPI } from "../services/api";
import { FiSearch } from "react-icons/fi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { FavoritesContext } from "../context/FavoritesContext";

const Compare = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  const [popupMsg, setPopupMsg] = useState("");
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

  // Get user location
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

  // ✅ Wishlist handler with SweetAlert2 + badge update (FIXED URL)
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
      fetchFavoritesCount(); // ✅ Update badge after adding
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

  // ✅ Fetch suggestions while typing (FIXED to use productAPI instead of localhost)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setResult(null);
        setMatches([]);
        return;
      }

      try {
        const res = await productAPI.get(
          `/names/${encodeURIComponent(query)}`
        );
        setSuggestions(res.data);
        setHighlightIndex(-1);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const isExact = suggestions.includes(query.trim());

    if (isExact) {
      try {
        const res = await productAPI.get(
          `/compare/${encodeURIComponent(query)}`
        );
        setResult(res.data);
        setMatches([]);
        setError("");
        setPopupMsg(
          `🎉 The cheapest product is in ${res.data.cheapest.supermarket}!`
        );
      } catch (err) {
        console.error("Compare error:", err);
        setResult(null);
        setError("Product not found or error fetching data.");
      }
    } else {
      try {
        const res = await productAPI.get(
          `/names/${encodeURIComponent(query)}`
        );
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

  const handleSelectProduct = async (name) => {
    try {
      // reset map UI state before loading new product
      setMapError("");
      setMapLoading(true);
      setGoogleMapsLink("");
      setGoogleSearchLink("");
    } catch (e) {
      /* ignore */
    }

    try {
      const res = await productAPI.get(
        `/compare/${encodeURIComponent(name)}`
      );
      setResult(res.data);
      setMatches([]);
      setQuery(name);
      setSuggestions([]);
      setError("");
      setPopupMsg(
        `🎉 The cheapest product is in ${res.data.cheapest.supermarket}!`
      );

      // If we don't have a user location, ask for it before showing nearest store
      if (!userLocation) {
        setShowLocationPrompt(true);
      } else {
        setShowLocationPrompt(false);
      }
    } catch (err) {
      console.error("Compare select error:", err);
      setResult(null);
      setError("Product not found or error fetching data.");
    }
  };

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
          setAddressError(
            "Geolocation failed or denied. Enter address instead."
          );
        }
      );
    } else {
      setAddressError("Geolocation is not supported by your browser.");
    }
  };

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Map logic: show cheapest supermarket on map; works with or without geolocation
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

      // If we have user location, show it
      if (userLocation) {
        L.marker([userLocation.lat, userLocation.lng], {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
            iconSize: [35, 35],
          }),
        })
          .addTo(map)
          .bindPopup("You are here");

        // Google Maps link
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
        // No user location: center on store
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

    // First try to find the store near the user (if we have userLocation)
    if (userLocation) {
      const viewbox = `${userLocation.lng - 0.05},${
        userLocation.lat + 0.05
      },${userLocation.lng + 0.05},${userLocation.lat - 0.05}`;

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&viewbox=${viewbox}&bounded=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            addStoreMarker(data[0]);
          } else {
            // fallback to a global search for the store name
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
      // No user location: do a global search for the store name
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

  return (
    <div className="compare-container">
      <style>{`
        .compare-container { padding: 2rem; max-width: 950px; margin: auto; min-height: 100vh; font-family: 'Inter', sans-serif; background-color: #f5f7fa; }
        .compare-heading { font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 2rem; color: #222; }
        .search-box { position: relative; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem; }
        .input-wrapper { display: flex; align-items: center; background-color: #fff; border-radius: 8px; padding: 0.4rem 0.6rem; box-shadow: 0 3px 6px rgba(0,0,0,0.1); }
        .search-icon { margin-right: 0.5rem; font-size: 1.2rem; color: #888; }
        .search-input { flex: 1; border: none; outline: none; font-size: 1rem; padding: 0.4rem; }
        .compare-button { margin-top: 0.6rem; padding: 0.6rem 1rem; background-color: #007bff; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; align-self: flex-start; transition: all 0.2s ease; }
        .compare-button:hover { background-color: #0056b3; }
        .dropdown { position: absolute; top: calc(100% + 0.6rem); left: 0; right: 0; background-color: #fff; border: 1px solid #ddd; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 20; box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
        .suggestion { padding: 0.6rem; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s ease; }
        .suggestion:hover, .suggestion.active { background-color: #e8f0ff; font-weight: 600; color: #007bff; }
        #map { width: 100%; height: 400px; margin-top: 1rem; border-radius: 12px; }
        .popup-msg { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #007bff; color: #fff; padding: 0.8rem 1.2rem; border-radius: 10px; font-weight: 600; box-shadow: 0 6px 20px rgba(0,0,0,0.2); animation: slideUp 0.5s ease forwards; z-index: 100; }
        .wishlist-btn { margin-left: 1rem; padding: 0.3rem 0.6rem; background-color: #ff4081; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: transform 0.1s ease; }
        .wishlist-btn:hover { transform: scale(1.1); }
        .google-link { margin-top: 0.5rem; display: inline-block; background-color: #28a745; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; }
        .google-link:hover { background-color: #218838; }
        @keyframes slideUp { from { opacity:0; transform: translate(-50%,20px); } to { opacity:1; transform: translate(-50%,0); } }
      `}</style>

      <h2 className="compare-heading">🔍 Compare Product Prices</h2>

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

        {suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((name, i) => (
              <li
                key={i}
                className={`suggestion ${
                  highlightIndex === i ? "active" : ""
                }`}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => handleSelectProduct(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}

        {/* Location prompt: appears when product selected but no userLocation */}
        {showLocationPrompt && (
          <div
            style={{
              marginTop: 12,
              background: "#fff",
              padding: 12,
              borderRadius: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              textAlign: "left",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0" }}>Where are you located?</h4>
            <p style={{ margin: "0 0 8px 0", color: "#555" }}>
              Allow the browser to detect your location or enter an address/place
              (city, street, postal code).
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <button
                onClick={handleUseGeolocation}
                style={{
                  padding: "0.5rem 0.8rem",
                  borderRadius: 6,
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                }}
              >
                Use my current location
              </button>
              <input
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter address or city"
                style={{
                  flex: 1,
                  padding: "0.45rem",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />
              <button
                onClick={async () => {
                  if (manualAddress.trim()) await geocodeAddress(manualAddress);
                }}
                style={{
                  padding: "0.5rem 0.8rem",
                  borderRadius: 6,
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                }}
              >
                Search
              </button>
            </div>
            {addressError && (
              <p style={{ color: "red", margin: 0 }}>{addressError}</p>
            )}
          </div>
        )}

        <button onClick={handleSearch} className="compare-button">
          Compare
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Render matches (prefix results) when available */}
      {matches && matches.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h4>Did you mean:</h4>
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {matches.map((m, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectProduct(m)}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="result-box">
          <h3 className="result-title">
            Results for: <strong>{result.product}</strong>
          </h3>
          <table className="result-table">
            <tbody>
              {result.supermarkets.map((p, i) => (
                <tr
                  key={i}
                  className={
                    p.supermarket === result.cheapest.supermarket
                      ? "best-row"
                      : ""
                  }
                >
                  <td>{p.supermarket}</td>
                  <td>
                    {p.price.toFixed(2)} €
                    {p.supermarket === result.cheapest.supermarket && (
                      <button
                        onClick={() => handleAddToWishlist(p._id)}
                        className="wishlist-btn"
                      >
                        ❤️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="cheapest">
            ✅ Cheapest: <strong>{result.cheapest.supermarket}</strong> at{" "}
            <strong>{result.cheapest.price.toFixed(2)} €</strong>
          </p>

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
      )}

      {popupMsg && (
        <div className="popup-msg" onClick={() => setPopupMsg("")}>
          {popupMsg}
        </div>
      )}
    </div>
  );
};

export default Compare;
