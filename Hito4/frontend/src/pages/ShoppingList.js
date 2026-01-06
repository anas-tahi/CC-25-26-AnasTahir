import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./shoppingList.css";

const ShoppingList = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const [items, setItems] = useState([]);
  const [result, setResult] = useState(null);
  const [closing, setClosing] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [mapLoading, setMapLoading] = useState(false);

  const dropdownRef = useRef(null);
  const mapRef = useRef(null);

  // ============================
  // GET USER LOCATION
  // ============================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {}
      );
    }
  }, []);

  // ============================
  // FETCH PRODUCT SUGGESTIONS
  // ============================
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) return setSuggestions([]);

      try {
        const res = await axios.get(
          `https://product-service-3lsh.onrender.com/products?search=${query}`
        );
        setSuggestions(res.data.products || []);
        setHighlightIndex(-1);
      } catch {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [query]);

  // ============================
  // ADD / REMOVE ITEMS
  // ============================
  const addItem = (name) => {
    if (!name || items.includes(name)) return;
    setItems([...items, name]);
    setQuery("");
    setSuggestions([]);
  };

  const removeItem = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  // ============================
  // RESET COMPARISON
  // ============================
  const resetComparison = () => {
    setClosing(true);
    setTimeout(() => {
      setResult(null);
      setItems([]);
      setQuery("");
      setSuggestions([]);
      setHighlightIndex(-1);
      setUserLocation(null);
      setShowLocationPrompt(false);
      setManualAddress("");
      setAddressError("");
      setGoogleMapsLink("");
      if (mapRef.current) mapRef.current.innerHTML = "";
      setClosing(false);
    }, 400);
  };

  // ============================
  // COMPARE LIST
  // ============================
  const compareList = async () => {
    if (items.length === 0) return;

    setMapLoading(true);
    setResult(null);
    setGoogleMapsLink("");

    try {
      const res = await axios.post(
        "https://product-service-3lsh.onrender.com/compare-list",
        { products: items }
      );

      setResult(res.data);

      if (!userLocation) setShowLocationPrompt(true);
    } catch (err) {
      console.error("Compare list error:", err);
    }

    setMapLoading(false);
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

      if (data.length > 0) {
        setUserLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
        setShowLocationPrompt(false);
        return true;
      }
      setAddressError("Address not found.");
      return false;
    } catch {
      setAddressError("Unable to resolve address.");
      return false;
    }
  };

  // ============================
  // USE BROWSER LOCATION
  // ============================
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setAddressError("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setShowLocationPrompt(false);
      },
      () => setAddressError("Geolocation failed.")
    );
  };

  // ============================
  // KEYBOARD NAVIGATION
  // ============================
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0) addItem(suggestions[highlightIndex].name);
      else addItem(query);
    }
  };

  // ============================
  // MAP LOGIC
  // ============================
  useEffect(() => {
    if (!result || !mapRef.current) return;
    mapRef.current.innerHTML = "";

    const map = L.map(mapRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const storeName = result.best.supermarket;
    const q = encodeURIComponent(storeName);

    const addStoreMarker = (lat, lon) => {
      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`${storeName} ✅ Cheapest`)
        .openPopup();

      if (userLocation) {
        L.marker([userLocation.lat, userLocation.lng])
          .addTo(map)
          .bindPopup("You");

        map.fitBounds(
          [
            [userLocation.lat, userLocation.lng],
            [lat, lon],
          ],
          { padding: [50, 50] }
        );

        setGoogleMapsLink(
          `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lon}`
        );
      } else {
        map.setView([lat, lon], 15);
        setGoogleMapsLink(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
        );
      }
    };

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) addStoreMarker(parseFloat(data[0].lat), parseFloat(data[0].lon));
      })
      .catch((err) => console.error("Map error:", err));
  }, [result, userLocation]);

  // ============================
  // RENDER
  // ============================
  return (
    <div className="list-container">
      <h1 className="list-title">🛒 Compare Your Shopping List</h1>

      {!result && (
        <>
          {/* SEARCH BOX */}
          <div className="list-input-box search-box" ref={dropdownRef}>
            <div className="input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Start typing a product name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="list-input search-input"
              />
            </div>

            {/* SUGGESTIONS */}
            {suggestions.length > 0 && (
              <ul className="dropdown list-suggestions">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className={`list-suggestion-item suggestion ${
                      highlightIndex === i ? "active" : ""
                    }`}
                    onMouseEnter={() => setHighlightIndex(i)}
                    onClick={() => addItem(s.name)}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}

            <button onClick={() => addItem(query)} className="compare-button list-add-btn">
              Add
            </button>
          </div>

          <ul className="list-items">
            {items.map((item, i) => (
              <li key={i} className="list-item">
                {item}
                <button className="list-remove-btn" onClick={() => removeItem(i)}>✖</button>
              </li>
            ))}
          </ul>

          <button onClick={compareList} className="list-compare-btn">Compare List</button>
        </>
      )}

      {showLocationPrompt && !result && (
        <div className="location-prompt">
          <h4>Where are you located?</h4>
          <div className="location-controls">
            <button className="location-button-primary" onClick={handleUseGeolocation}>Use my location</button>
            <input
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter address"
              className="location-input"
            />
            <button className="location-button-secondary" onClick={() => geocodeAddress(manualAddress)}>Search</button>
          </div>
          {addressError && <p className="location-error">{addressError}</p>}
        </div>
      )}

      {result && (
        <div className={`list-results ${closing ? "fade-out" : "fade-in"}`}>
          <button
            onClick={resetComparison}
            className="close-btn"
            title="Close Comparison"
          >
            ✖
          </button>

          <h2>🏆 Best Supermarket: {result.best.supermarket}</h2>
          <p>Total: <strong>{result.best.total} €</strong></p>

          <h3>Full Breakdown</h3>
          <div className="list-grid">
            {result.supermarkets.map((s, i) => (
              <div key={i} className="list-card">
                <h4>{s.supermarket}</h4>
                <p>Total: {s.total} €</p>
                <p>Missing items: {s.missing}</p>
              </div>
            ))}
          </div>

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
    </div>
  );
};

export default ShoppingList;
