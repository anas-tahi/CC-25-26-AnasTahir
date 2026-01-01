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

  // Wishlist handler
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

  // Fetch suggestions while typing
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

  // Map logic
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

  return (
    <div className="compare-container">
      <style>{`
        .compare-container {
          padding: 2rem;
          max-width: 1000px;
          margin: auto;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .compare-heading {
          font-size: 2.2rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 2rem;
        }

        .compare-heading span {
          background: linear-gradient(90deg, #007bff, #ff4081);
          -webkit-background-clip: text;
          color: transparent;
        }

        .search-box {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background-color: var(--card);
          border-radius: 999px;
          padding: 0.4rem 0.9rem;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
          border: 1px solid var(--border);
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }

        .input-wrapper:focus-within {
          box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
          border-color: #007bff;
          transform: translateY(-1px);
        }

        .search-icon {
          margin-right: 0.5rem;
          font-size: 1.3rem;
          color: #888;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1rem;
          padding: 0.4rem;
          background: transparent;
          color: var(--text);
        }

        .compare-button {
          margin-top: 0.2rem;
          padding: 0.6rem 1.4rem;
          background: linear-gradient(90deg, #007bff, #00b4d8);
          color: #fff;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
          align-self: flex-start;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 6px 14px rgba(0,123,255,0.4);
        }

        .compare-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(0,123,255,0.5);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 0.6rem);
          left: 0;
          right: 0;
          background-color: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          max-height: 220px;
          overflow-y: auto;
          z-index: 20;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .suggestion {
          padding: 0.6rem 0.9rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          transition: background 0.2s ease, color 0.2s ease, font-weight 0.2s ease;
        }

        .suggestion:last-child {
          border-bottom: none;
        }

        .suggestion:hover,
        .suggestion.active {
          background-color: rgba(0,123,255,0.07);
          font-weight: 600;
          color: #007bff;
        }

        .did-you-mean {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .did-you-mean h4 {
          margin-bottom: 0.5rem;
        }

        .did-you-mean-buttons {
          display: flex;
          gap: 0.6rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .did-you-mean-button {
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--card);
          cursor: pointer;
          font-size: 0.95rem;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }

        .did-you-mean-button:hover {
          background: rgba(0,123,255,0.08);
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.12);
        }

        .location-prompt {
          margin-top: 0.75rem;
          background: var(--card);
          padding: 0.9rem;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .location-prompt-title {
          margin: 0 0 0.4rem 0;
          font-weight: 600;
        }

        .location-prompt-text {
          margin: 0 0 0.6rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .location-controls {
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.4rem;
          flex-wrap: wrap;
        }

        .location-button-primary {
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          background: #007bff;
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .location-input {
          flex: 1;
          min-width: 180px;
          padding: 0.45rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 0.9rem;
          background: var(--card);
          color: var(--text);
        }

        .location-button-secondary {
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          background: #28a745;
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .location-error {
          color: #e74c3c;
          margin: 0;
          font-size: 0.85rem;
        }

        .error-text {
          color: #e74c3c;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .result-box {
          margin-top: 1rem;
          padding: 1.5rem;
          border-radius: 16px;
          background: var(--card);
          box-shadow: 0 10px 24px rgba(0,0,0,0.15);
          animation: fadeInUp 0.4s ease forwards;
        }

        .result-title {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .result-card {
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: radial-gradient(circle at top left, #f9fbff, var(--card));
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .result-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.18);
          border-color: #007bff;
        }

        .result-card.best {
          border: 2px solid #28a745;
          box-shadow: 0 10px 26px rgba(40,167,69,0.35);
          background: radial-gradient(circle at top left, #e9ffe9, var(--card));
        }

        .result-supermarket {
          font-weight: 700;
          font-size: 1.05rem;
        }

        .result-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
        }

        .result-price {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .best-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          background: #28a745;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .wishlist-btn {
          padding: 0.3rem 0.7rem;
          background-color: #ff4081;
          color: #fff;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          font-size: 0.85rem;
        }

        .wishlist-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(255,64,129,0.5);
        }

        .cheapest {
          margin-top: 0.6rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .map-section {
          margin-top: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        #map {
          width: 100%;
          height: 360px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .google-link {
          margin-top: 0.25rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #28a745;
          color: white;
          padding: 0.55rem 1.1rem;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: 0 6px 18px rgba(40,167,69,0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .google-link:hover {
          background-color: #218838;
          transform: translateY(-1px);
          box-shadow: 0 10px 26px rgba(40,167,69,0.55);
        }

        .popup-msg {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(90deg, #007bff, #ff4081);
          color: #fff;
          padding: 0.8rem 1.3rem;
          border-radius: 999px;
          font-weight: 600;
          box-shadow: 0 10px 28px rgba(0,0,0,0.35);
          animation: slideUp 0.5s ease forwards;
          z-index: 100;
          cursor: pointer;
        }

        .map-loading {
          font-size: 0.9rem;
          color: #555;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .compare-container {
            padding: 1.2rem;
          }
          .compare-heading {
            font-size: 1.7rem;
          }
          .result-box {
            padding: 1.1rem;
          }
        }
      `}</style>

      <h2 className="compare-heading">
        🔍 <span>Compare Product Prices</span>
      </h2>

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

        {showLocationPrompt && (
          <div className="location-prompt">
            <h4 className="location-prompt-title">Where are you located?</h4>
            <p className="location-prompt-text">
              Allow the browser to detect your location or enter an address/place
              (city, street, postal code).
            </p>
            <div className="location-controls">
              <button
                onClick={handleUseGeolocation}
                className="location-button-primary"
              >
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
            {addressError && (
              <p className="location-error">{addressError}</p>
            )}
          </div>
        )}

        <button onClick={handleSearch} className="compare-button">
          Compare
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

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
                <div
                  key={i}
                  className={`result-card ${isBest ? "best" : ""}`}
                >
                  <div className="result-supermarket">{p.supermarket}</div>
                  <div className="result-price-row">
                    <div>
                      <div className="result-price">
                        {p.price.toFixed(2)} €
                      </div>
                      {isBest && (
                        <div className="best-badge">
                          ✅ Cheapest
                        </div>
                      )}
                    </div>
                    {isBest && (
                      <button
                        onClick={() => handleAddToWishlist(p._id)}
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

      {popupMsg && (
        <div className="popup-msg" onClick={() => setPopupMsg("")}>
          {popupMsg}
        </div>
      )}
    </div>
  );
};

export default Compare;
