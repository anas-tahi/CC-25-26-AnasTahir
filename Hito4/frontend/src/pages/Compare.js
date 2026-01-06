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
      Swal.fire({
        title: "❌ Error",
        text: err.response?.data?.message || "Failed to add to wishlist",
        icon: "error",
      });
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
      } catch {
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

    const trimmed = query.trim();
    const isExact = suggestions.includes(trimmed);

    if (isExact) {
      try {
        const res = await productAPI.get(`/compare/${encodeURIComponent(trimmed)}`);
        setResult(res.data);
        setMatches([]);
        setError("");
      } catch {
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
      } catch {
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
      setGoogleMapsLink("");
      setMapLoading(true);

      const res = await productAPI.get(`/compare/${encodeURIComponent(name)}`);
      setResult(res.data);
      setMatches([]);
      setQuery(name);
      setSuggestions([]);
      setError("");

      if (!userLocation) setShowLocationPrompt(true);
      else setShowLocationPrompt(false);
    } catch {
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

      if (data.length > 0) {
        setUserLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
        setShowLocationPrompt(false);
      } else {
        setAddressError("Address not found.");
      }
    } catch {
      setAddressError("Unable to resolve address.");
    }
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
  // MAP LOGIC (FIXED)
  // ============================
  useEffect(() => {
    if (!result || !mapRef.current) return;

    // ✅ FIX: clear old map instance
    mapRef.current.innerHTML = "";

    const map = L.map(mapRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const storeName = result.cheapest.supermarket;
    const q = encodeURIComponent(storeName);

    const addStoreMarker = ({ lat, lon }) => {
      const storeLat = parseFloat(lat);
      const storeLon = parseFloat(lon);

      L.marker([storeLat, storeLon])
        .addTo(map)
        .bindPopup(`${storeName} ✅ Cheapest store`)
        .openPopup();

      if (userLocation) {
        L.marker([userLocation.lat, userLocation.lng])
          .addTo(map)
          .bindPopup("You are here");

        map.fitBounds([
          [userLocation.lat, userLocation.lng],
          [storeLat, storeLon],
        ]);

        setGoogleMapsLink(
          `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${storeLat},${storeLon}`
        );
      } else {
        map.setView([storeLat, storeLon], 15);
        setGoogleMapsLink(
          `https://www.google.com/maps/search/?api=1&query=${storeLat},${storeLon}`
        );
      }
    };

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) addStoreMarker(data[0]);
      })
      .catch((err) => console.error("Map error:", err));
  }, [result, userLocation]);

  // ============================
  // RENDER
  // ============================
  return (
    <div className="compare-container">
      <h2 className="compare-heading">🔍 Compare Product Prices</h2>

      <div className="search-box" ref={dropdownRef}>
        <div className="input-wrapper">
          <FiSearch className="search-icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Start typing a product name..."
          />
        </div>

        <button onClick={handleSearch}>Compare</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="result-box">
          <h3>{result.product}</h3>

          {result.supermarkets.map((p, i) => (
            <div key={i}>
              {p.supermarket} — {p.price.toFixed(2)} €
              {p.supermarket === result.cheapest.supermarket && (
                <button onClick={() => handleAddToWishlist(p.id)}>
                  ❤️ Wishlist
                </button>
              )}
            </div>
          ))}

          <div className="map-section">
            {mapLoading && <p>Loading map…</p>}
            <div id="map" ref={mapRef}></div>

            {googleMapsLink && (
              <a href={googleMapsLink} target="_blank" rel="noreferrer">
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
