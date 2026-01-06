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
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const token = localStorage.getItem("token");
  const mapRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const { fetchFavoritesCount } = useContext(FavoritesContext);

  // ============================
  // GET USER LOCATION ON LOAD
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
        () => setShowAddressModal(true)
      );
    } else {
      setShowAddressModal(true);
    }
  }, []);

  // ============================
  // MANUAL ADDRESS SUBMIT
  // ============================
  const handleManualAddressSubmit = async () => {
    setAddressError("");
    if (!manualAddress.trim()) {
      setAddressError("Please enter an address.");
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualAddress
        )}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setUserLocation({ lat, lng: lon });
        setShowAddressModal(false);
        setAddressError("");
      } else {
        setAddressError("Address not found. Try again.");
      }
    } catch (err) {
      console.error("Geocode error:", err);
      setAddressError("Unable to resolve address. Try again later.");
    }
  };

  // ============================
  // ADD TO WISHLIST
  // ============================
  const handleAddToWishlist = async (productId) => {
    try {
      await axios.post(
        "https://product-service-3lsh.onrender.com/wishlist",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        title: "❤️ Added to wishlist!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchFavoritesCount();
    } catch (err) {
      console.error("❌ Wishlist error:", err.response?.data || err);
      if (err.response?.data?.message) {
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
        const names = (res.data || []).map((p) => p.name);
        setSuggestions(names);
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

    if (!userLocation) {
      setShowAddressModal(true);
      return;
    }

    const trimmed = query.trim();
    const isExact = suggestions.includes(trimmed);

    if (isExact) {
      try {
        const res = await productAPI.get(`/compare/${encodeURIComponent(trimmed)}`);
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
        const res = await productAPI.get(`/names/${encodeURIComponent(trimmed)}`);
        const names = (res.data || []).map((p) => p.name);
        setMatches(names);
        setResult(null);
        setError(names.length ? "" : "No matching products found.");
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
    setMapLoading(true);
    setGoogleMapsLink("");
    if (!userLocation) {
      setShowAddressModal(true);
      return;
    }
    try {
      const res = await productAPI.get(`/compare/${encodeURIComponent(name)}`);
      setResult(res.data);
      setMatches([]);
      setQuery(name);
      setSuggestions([]);
      setError("");
    } catch (err) {
      console.error("Compare select error:", err);
      setResult(null);
      setError("Product not found or error fetching data.");
    } finally {
      setMapLoading(false);
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
      if (highlightIndex >= 0) handleSelectProduct(suggestions[highlightIndex]);
      else handleSearch();
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
    if (!result || !userLocation || !mapRef.current) return;

    setMapLoading(true);

    const map = L.map(mapRef.current);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const storeName = result.cheapest.supermarket;
    const q = encodeURIComponent(storeName);

    const addStoreMarker = ({ lat, lon }) => {
      const storeLat = parseFloat(lat);
      const storeLon = parseFloat(lon);

      // Store marker
      L.marker([storeLat, storeLon], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
          iconSize: [35, 35],
        }),
      })
        .addTo(map)
        .bindPopup(`${storeName} ✅ Cheapest store`)
        .openPopup();

      // User marker
      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
          iconSize: [35, 35],
        }),
      })
        .addTo(map)
        .bindPopup("You are here");

      map.fitBounds(
        [
          [userLocation.lat, userLocation.lng],
          [storeLat, storeLon],
        ],
        { padding: [50, 50] }
      );

      setGoogleMapsLink(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${storeLat},${storeLon}`
      );
      setMapLoading(false);
    };

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) addStoreMarker(data[0]);
        else setMapLoading(false);
      })
      .catch((err) => {
        console.error("Map error:", err);
        setMapLoading(false);
      });

    return () => map.remove();
  }, [result, userLocation]);

  // ============================
  // DRAG LOGIC
  // ============================
  const startDrag = (e) => {
    setDragging(true);
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
    dragOffset.current = {
      x: clientX - modalPosition.x,
      y: clientY - modalPosition.y,
    };
  };

  const onDrag = (e) => {
    if (dragging) {
      const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
      setModalPosition({
        x: clientX - dragOffset.current.x,
        y: clientY - dragOffset.current.y,
      });
    }
  };

  const stopDrag = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onDrag);
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onDrag);
      window.removeEventListener("touchend", stopDrag);
    };
  });

  // ============================
  // EXIT COMPARISON
  // ============================
  const exitComparison = () => {
    setResult(null);
    setGoogleMapsLink("");
    setQuery("");
    setSuggestions([]);
    setMatches([]);
    setError("");
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="compare-container">
      <h2 className="compare-heading">🔍 Compare Product Prices</h2>

      {!result && (
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
                  className={`suggestion ${highlightIndex === i ? "active" : ""}`}
                  onMouseEnter={() => setHighlightIndex(i)}
                  onClick={() => handleSelectProduct(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}

          <button onClick={handleSearch} className="compare-button">
            Compare
          </button>
        </div>
      )}

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

      {/* DRAGGABLE MANUAL ADDRESS MODAL */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div
            ref={modalRef}
            className="modal-content"
            style={{ left: modalPosition.x, top: modalPosition.y, position: "absolute" }}
          >
            <div
              className="modal-header"
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              style={{ cursor: "grab" }}
            >
              <span>Enter your address</span>
              <button
                className="modal-close"
                onClick={() => setShowAddressModal(false)}
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter your address..."
            />
            {addressError && <p className="error-text">{addressError}</p>}
            <button onClick={handleManualAddressSubmit}>Submit</button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="result-box">
          <div className="exit-btn-wrapper">
            <button className="exit-btn" onClick={exitComparison}>
              × Exit Comparison
            </button>
          </div>
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

          <div className="map-section">
            {mapLoading && <p className="map-loading">Loading map…</p>}
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
