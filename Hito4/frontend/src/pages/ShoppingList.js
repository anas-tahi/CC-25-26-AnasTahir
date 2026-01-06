import { useState, useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./shoppingList.css";

const ShoppingList = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const [items, setItems] = useState([]);
  const [result, setResult] = useState(null);

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
      if (query.length < 1) return setSuggestions([]);

      try {
        const res = await axios.get(
          `https://product-service-3lsh.onrender.com/products?search=${query}`
        );
        // Remove duplicates by name
        const names = res.data.products || [];
        const uniqueNames = Array.from(new Set(names.map(p => p.name))).map(
          name => names.find(p => p.name === name)
        );
        setSuggestions(uniqueNames);
        setHighlightIndex(-1);
      } catch {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [query]);

  // ============================
  // ADD ITEM TO LIST
  // ============================
  const addItem = (name) => {
    if (!name || items.includes(name)) return;
    setItems([...items, name]);
    setQuery("");
    setSuggestions([]);
  };

  // ============================
  // REMOVE ITEM
  // ============================
  const removeItem = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
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

      if (!userLocation) {
        setShowLocationPrompt(true);
      }
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
      if (highlightIndex >= 0) {
        addItem(suggestions[highlightIndex].name);
      } else {
        addItem(query);
      }
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
        .bindPopup(`${storeName} (Cheapest)`)
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

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          addStoreMarker(
            parseFloat(data[0].lat),
            parseFloat(data[0].lon)
          );
        }
      })
      .catch((err) => console.error("Map error:", err));

    return () => map.remove();
  }, [result, userLocation]);

  // ============================
  // EXIT COMPARISON VIEW
  // ============================
  const handleExitComparison = () => {
    setResult(null);
    setGoogleMapsLink("");
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="list-container">
      <h1 className="list-title">🛒 Compare Your Shopping List</h1>

      {!result && (
        <>
          <div className="list-input-box">
            <input
              type="text"
              placeholder="Search product..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="list-input"
            />
            <button onClick={() => addItem(query)} className="list-add-btn">
              Add
            </button>
          </div>

          {suggestions.length > 0 && (
            <ul className="list-suggestions" ref={dropdownRef}>
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className={`list-suggestion-item ${
                    highlightIndex === i ? "active" : ""
                  }`}
                  onClick={() => addItem(s.name)}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}

          <ul className="list-items">
            {items.map((item, i) => (
              <li key={i} className="list-item">
                {item}
                <button className="list-remove-btn" onClick={() => removeItem(i)}>
                  ✖
                </button>
              </li>
            ))}
          </ul>

          <button onClick={compareList} className="list-compare-btn">
            Compare List
          </button>
        </>
      )}

      {showLocationPrompt && !result && (
        <div className="location-prompt">
          <h4>Where are you located?</h4>
          <button onClick={handleUseGeolocation}>Use my location</button>
          <input
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Enter address"
          />
          <button onClick={() => geocodeAddress(manualAddress)}>Search</button>
          {addressError && <p className="location-error">{addressError}</p>}
        </div>
      )}

      {result && (
        <div className="list-results">
          <button
            className="exit-comparison-btn"
            onClick={handleExitComparison}
            title="Exit Comparison"
          >
            ✖
          </button>

          <h2>🏆 Best Supermarket: {result.best.supermarket}</h2>
          <p>
            Total: <strong>{result.best.total} €</strong>
          </p>

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
