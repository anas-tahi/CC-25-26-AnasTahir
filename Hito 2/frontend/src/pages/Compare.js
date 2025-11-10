import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
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
  const [matches, setMatches] = useState({});
  const [popupMsg, setPopupMsg] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [nearestStore, setNearestStore] = useState(null);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
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

  const handleAddToWishlist = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/wishlist",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        title: "✅ Added to wishlist!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchFavoritesCount();
    } catch (err) {
      if (err.response && err.response.data?.message) {
        Swal.fire({
          title: "⚠️ Already added",
          text: err.response.data.message,
          icon: "info",
        });
      } else {
        console.error("❌ Wishlist error:", err);
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
        setMatches({});
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/products/names/${query}`
        );
        setSuggestions(res.data);
        setHighlightIndex(-1);
      } catch {
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
        const res = await axios.get(
          `http://localhost:5000/products/compare/${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResult(res.data);
        setMatches({});
        setError("");
        setPopupMsg(
          `🎉 The cheapest product is in ${res.data.cheapest.supermarket}!`
        );
      } catch {
        setResult(null);
        setError("Product not found or error fetching data.");
      }
    } else {
      try {
        const res = await axios.get(
          `http://localhost:5000/products/starts-with/${encodeURIComponent(
            query
          )}`
        );
        setMatches(res.data);
        setResult(null);
        setError("");
      } catch {
        setMatches({});
        setError("No matching products found.");
      }
    }
  };

  const handleSelectProduct = async (name) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/products/compare/${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
      setMatches({});
      setQuery(name);
      setSuggestions([]);
      setError("");
      setPopupMsg(
        `🎉 The cheapest product is in ${res.data.cheapest.supermarket}!`
      );
    } catch {
      setResult(null);
      setError("Product not found or error fetching data.");
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

  // Map logic: find nearest store using Nominatim with user coordinates
  useEffect(() => {
    if (!result || !mapRef.current || !userLocation) return;

    const map = L.map(mapRef.current).setView(
      [userLocation.lat, userLocation.lng],
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // User location marker
    L.marker([userLocation.lat, userLocation.lng], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
        iconSize: [35, 35],
      }),
    })
      .addTo(map)
      .bindPopup("You are here")
      .openPopup();

    // Search nearest cheapest supermarket using bounded box around user
    const storeName = result.cheapest.supermarket;
    const query = encodeURIComponent(storeName);
    const viewbox = `${userLocation.lng - 0.05},${userLocation.lat + 0.05},${userLocation.lng + 0.05},${userLocation.lat - 0.05}`;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&viewbox=${viewbox}&bounded=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const store = data[0];
          const lat = parseFloat(store.lat);
          const lon = parseFloat(store.lon);
          setNearestStore({ lat, lon, name: store.display_name });

          L.marker([lat, lon], {
            icon: L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
              iconSize: [35, 35],
            }),
          })
            .addTo(map)
            .bindPopup(`${storeName} ✅ Cheapest store`)
            .openPopup();

          // Google Maps link
          setGoogleMapsLink(
            `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lon}`
          );

          map.fitBounds(
            [
              [userLocation.lat, userLocation.lng],
              [lat, lon],
            ],
            { padding: [50, 50] }
          );
        }
      })
      .catch((err) => console.error("Nominatim error:", err));

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

      {error && <p style={{ color: "red" }}>{error}</p>}

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
                  className={p.supermarket === result.cheapest.supermarket ? "best-row" : ""}
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
