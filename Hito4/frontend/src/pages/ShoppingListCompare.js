import { useState, useEffect, useRef } from "react";
import { productAPI } from "../services/api";
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ShoppingListCompare.css";

/* =========================
   RECOMMENDED LISTS
========================= */
const RECOMMENDED = {
  student: [
    {
      name: "Student Basic",
      items: ["Milk", "Bread", "Eggs", "Pasta", "Tomato Sauce"],
    },
    {
      name: "Student Budget",
      items: ["Rice", "Frozen Pizza", "Chicken Breast", "Apples"],
    },
  ],
  family: [
    {
      name: "Family Weekly",
      items: ["Milk", "Bread", "Chicken", "Rice", "Vegetables", "Fruit"],
    },
    {
      name: "Family Big Basket",
      items: ["Pasta", "Tomato Sauce", "Cheese", "Yogurt", "Eggs", "Juice"],
    },
  ],
};

const ShoppingListCompare = () => {
  const [mode, setMode] = useState(null); // student | family | custom
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const token = localStorage.getItem("token");

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
     LOAD PRODUCT
  ========================= */
  const loadProduct = async (name) => {
    const res = await productAPI.get(`/compare/${name}`);
    return res.data;
  };

  /* =========================
     LOAD RECOMMENDED LIST
  ========================= */
  const loadRecommendedList = async (list) => {
    try {
      setProducts([]);
      setShowCompare(false);

      const loaded = [];
      for (const item of list.items) {
        const p = await loadProduct(item);
        loaded.push(p);
      }
      setProducts(loaded);
    } catch {
      Swal.fire("Error", "Failed to load list", "error");
    }
  };

  /* =========================
     ADD CUSTOM PRODUCT
  ========================= */
  const addProduct = async () => {
    if (!query.trim()) return;
    if (products.find((p) => p.product === query)) return;

    try {
      const p = await loadProduct(query);
      setProducts((prev) => [...prev, p]);
      setQuery("");
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
     SAVE LIST
  ========================= */
  const saveListToProfile = async () => {
    if (!cheapestMarket) return;

    const items = products.map((p) => {
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
          name: "Saved Shopping List",
          items,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Saved!", "List added to your profile ❤️", "success");
    } catch {
      Swal.fire("Error", "Failed to save list.", "error");
    }
  };

  /* =========================
     MAP
  ========================= */
  useEffect(() => {
    if (!showCompare || !mapRef.current || !userLocation) return;

    if (mapInstance.current) mapInstance.current.remove();

    mapInstance.current = L.map(mapRef.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapInstance.current
    );

    return () => mapInstance.current?.remove();
  }, [showCompare, userLocation]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="sl-container">
      <h2>🛒 Shopping List Compare</h2>

      {!mode && (
        <div className="sl-mode-select">
          <button onClick={() => setMode("student")}>🎓 Student Lists</button>
          <button onClick={() => setMode("family")}>👨‍👩‍👧 Family Lists</button>
          <button onClick={() => setMode("custom")}>✍️ Create My Own List</button>
        </div>
      )}

      {mode === "student" &&
        RECOMMENDED.student.map((l, i) => (
          <button
            key={i}
            className="sl-list-btn"
            onClick={() => loadRecommendedList(l)}
          >
            {l.name}
          </button>
        ))}

      {mode === "family" &&
        RECOMMENDED.family.map((l, i) => (
          <button
            key={i}
            className="sl-list-btn"
            onClick={() => loadRecommendedList(l)}
          >
            {l.name}
          </button>
        ))}

      {mode === "custom" && (
        <div className="sl-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Add product..."
          />
          <button onClick={addProduct}>Add</button>
        </div>
      )}

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

      {showCompare && (
        <div className="sl-results">
          {Object.keys(totals).map((m) => (
            <div
              key={m}
              className={`sl-total ${
                m === cheapestMarket ? "best" : ""
              }`}
            >
              {m}: €{totals[m].toFixed(2)}
              {m === cheapestMarket && " ❤️"}
            </div>
          ))}

          <button className="save-btn" onClick={saveListToProfile}>
            Save to Profile
          </button>

          <div ref={mapRef} className="sl-map" />
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
