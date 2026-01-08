import { useState, useEffect, useRef, useContext } from "react";
import { productAPI } from "../services/api";
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ShoppingListCompare.css";
import { FavoritesContext } from "../context/FavoritesContext";

const ShoppingListCompare = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const token = localStorage.getItem("token");
  const { fetchFavoritesCount } = useContext(FavoritesContext);

  /* =========================
     LOCATION
  ========================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(null)
    );
  }, []);

  /* =========================
     AUTOCOMPLETE
  ========================= */
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const load = async () => {
      try {
        const res = await productAPI.get(`/names/${query}`);
        setSuggestions(res.data.map((p) => p.name));
      } catch {
        setSuggestions([]);
      }
    };
    load();
  }, [query]);

  /* =========================
     ADD PRODUCT (NO PRICES)
  ========================= */
  const addProduct = async (name) => {
    if (products.find((p) => p.product === name)) return;

    try {
      const res = await productAPI.get(`/compare/${name}`);
      setProducts((prev) => [...prev, res.data]);
      setQuery("");
      setSuggestions([]);
      setShowCompare(false);
    } catch {
      Swal.fire("Error", "Product not found", "error");
    }
  };

  /* =========================
     COMPARE LOGIC
  ========================= */
  const totals = {};
  products.forEach((p) =>
    p.supermarkets.forEach((s) => {
      totals[s.supermarket] = (totals[s.supermarket] || 0) + s.price;
    })
  );

  const cheapestMarket =
    Object.keys(totals).length > 0
      ? Object.keys(totals).reduce((a, b) =>
          totals[a] < totals[b] ? a : b
        )
      : null;

  /* =========================
     SAVE LIST TO PROFILE ✅
  ========================= */
  const saveListToProfile = async () => {
    if (!cheapestMarket) return;

    try {
      await axios.post(
        "https://auth-service-a73r.onrender.com/shopping-lists",
        {
          name: "My Shopping List",
          items: products.map((p) => {
            const cheapest = p.supermarkets.find(
              (s) => s.supermarket === cheapestMarket
            );
            return {
              product: p.product,
              supermarket: cheapest.supermarket,
              price: cheapest.price,
            };
          }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Saved!", "List added to your profile ❤️", "success");
      fetchFavoritesCount();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save list.", "error");
    }
  };

  /* =========================
     MAP (ONLY AFTER COMPARE)
  ========================= */
  useEffect(() => {
    if (!showCompare || !mapRef.current || !userLocation) return;

    const map = L.map(mapRef.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    mapReady && map.remove();
    setMapReady(true);

    return () => map.remove();
  }, [showCompare]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="sl-container">
      <h2>🛒 Shopping List Compare</h2>

      {/* SEARCH */}
      <div className="sl-search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
        />
        <button onClick={() => addProduct(query)}>Add</button>

        {suggestions.length > 0 && (
          <ul className="sl-suggestions">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => addProduct(s)}>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* LIST (NO PRICES) */}
      {products.length > 0 && (
        <div className="sl-products">
          {products.map((p, i) => (
            <div key={i} className="sl-item">
              {p.product}
            </div>
          ))}

          <button className="compare-btn" onClick={() => setShowCompare(true)}>
            Compare
          </button>
        </div>
      )}

      {/* RESULTS */}
      {showCompare && (
        <div className="sl-results">
          <h3>Totals</h3>

          {Object.keys(totals).map((m) => (
            <div
              key={m}
              className={`sl-total ${
                m === cheapestMarket ? "best" : ""
              }`}
            >
              {m}: €{totals[m].toFixed(2)}
              {m === cheapestMarket && <span> ❤️</span>}
            </div>
          ))}

          <button className="save-btn" onClick={saveListToProfile}>
            Save Cheapest to Profile
          </button>

          <div ref={mapRef} className="sl-map" />
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
