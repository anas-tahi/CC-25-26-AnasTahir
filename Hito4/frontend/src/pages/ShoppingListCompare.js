import { useState, useEffect, useRef, useContext } from "react";
import { productAPI } from "../services/api";
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ShoppingListCompare.css";
import { FavoritesContext } from "../context/FavoritesContext";

const recommendedLists = {
  student: [
    {
      name: "Student Breakfast Pack",
      items: ["Milk", "Bread", "Eggs", "Cereal", "Orange Juice"],
    },
    {
      name: "Student Snacks Pack",
      items: ["Chips", "Chocolate", "Cookies", "Soda", "Nuts"],
    },
  ],
  family: [
    {
      name: "Family Weekly Essentials",
      items: ["Rice", "Pasta", "Chicken", "Tomato Sauce", "Cheese"],
    },
    {
      name: "Family Snacks & Drinks",
      items: ["Juice", "Yogurt", "Cookies", "Cereal", "Soda"],
    },
  ],
};

const ShoppingListCompare = () => {
  const [mode, setMode] = useState(""); // "" | "student" | "family" | "custom"
  const [selectedList, setSelectedList] = useState(null); // selected recommended list
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const token = localStorage.getItem("token");
  const { fetchFavoritesCount } = useContext(FavoritesContext);

  /* ========= LOCATION ========= */
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

  /* ========= AUTOCOMPLETE ========= */
  useEffect(() => {
    if (mode !== "custom" || !query.trim()) {
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
  }, [query, mode]);

  /* ========= ADD PRODUCT (NO PRICE SHOWN) ========= */
  const addProduct = async (name) => {
    if (!name || products.find((p) => p.product === name)) return;

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

  /* ========= SELECT RECOMMENDED LIST ========= */
  const selectRecommendedList = async (list) => {
    setSelectedList(list);
    setProducts([]); // clear previous products
    setShowCompare(false);

    // fetch product info for each item
    const fetchedProducts = [];
    for (const name of list.items) {
      try {
        const res = await productAPI.get(`/compare/${name}`);
        fetchedProducts.push(res.data);
      } catch {
        console.warn(`Product ${name} not found`);
      }
    }
    setProducts(fetchedProducts);
  };

  /* ========= COMPARE ========= */
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

  /* ========= SAVE LIST (FIXED) ========= */
  const saveListToProfile = async () => {
    if (!products.length) return;

    const itemsAsStrings = products.map((p) => {
      if (!cheapestMarket) return p.product;
      const cheapest = p.supermarkets.find(
        (s) => s.supermarket === cheapestMarket
      );
      return `${p.product} - ${cheapest.supermarket} (€${cheapest.price.toFixed(
        2
      )})`;
    });

    try {
      await axios.post(
        "https://auth-service-a73r.onrender.com/shopping-lists",
        {
          name: selectedList ? selectedList.name : "Cheapest Shopping List",
          items: itemsAsStrings,
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

  /* ========= MAP ========= */
  useEffect(() => {
    if (!showCompare || !mapRef.current || !userLocation) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    mapInstance.current = L.map(mapRef.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapInstance.current
    );

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [showCompare, userLocation]);

  /* ========= UI ========= */
  return (
    <div className="sl-container">
      <h2>🛒 Shopping List Compare</h2>

      {/* MODE BUTTONS */}
      <div className="sl-modes">
        <button onClick={() => { setMode("student"); setSelectedList(null); setProducts([]); }}>
          Student Lists
        </button>
        <button onClick={() => { setMode("family"); setSelectedList(null); setProducts([]); }}>
          Family Lists
        </button>
        <button onClick={() => { setMode("custom"); setSelectedList(null); setProducts([]); }}>
          Create My Own List
        </button>
      </div>

      {/* RECOMMENDED LISTS */}
      {(mode === "student" || mode === "family") && (
        <div className="sl-recommended-lists">
          {recommendedLists[mode].map((l, i) => (
            <div key={i} className="sl-recommended-item">
              <span>{l.name}</span>
              <button onClick={() => selectRecommendedList(l)}>Select</button>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH / CUSTOM */}
      {(mode === "custom" || products.length > 0) && (
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
      )}

      {/* LIST */}
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
              className={`sl-total ${m === cheapestMarket ? "best" : ""}`}
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
