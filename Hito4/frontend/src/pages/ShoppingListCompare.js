import { useState, useEffect, useRef } from "react";
import { productAPI } from "../services/api";
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ShoppingListCompare.css";

const ShoppingListCompare = () => {
  const [mode, setMode] = useState(""); // "" | "custom"
  const [listName, setListName] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const token = localStorage.getItem("token");

  /* =======================
     LOCATION
  ======================= */
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

  /* =======================
     AUTOCOMPLETE (WORKS)
  ======================= */
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

  /* =======================
     ADD PRODUCT
  ======================= */
  const addProduct = async (name) => {
    if (!name || products.find((p) => p.product === name)) return;

    try {
      const res = await productAPI.get(`/compare/${name}`);
      setProducts((prev) => [...prev, res.data]);
      setQuery("");
      setSuggestions([]);
      setShowCompare(false);
    } catch {
      Swal.fire("Error", "Producto no encontrado", "error");
    }
  };

  /* =======================
     COMPARE
  ======================= */
  const totals = {};
  products.forEach((p) =>
    p.supermarkets.forEach((s) => {
      totals[s.supermarket] =
        (totals[s.supermarket] || 0) + Number(s.price);
    })
  );

  const cheapestMarket =
    Object.keys(totals).length > 0
      ? Object.keys(totals).reduce((a, b) =>
          totals[a] < totals[b] ? a : b
        )
      : null;

  /* =======================
     SAVE LIST (FIXED)
  ======================= */
  const saveListToProfile = async () => {
    if (!products.length) {
      Swal.fire("Error", "La lista está vacía", "error");
      return;
    }

    if (!listName.trim()) {
      Swal.fire("Error", "Pon un nombre a tu lista", "error");
      return;
    }

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
          name: listName,
          items,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Guardado", "Lista guardada correctamente ❤️", "success");
    } catch {
      Swal.fire("Error", "No se pudo guardar la lista", "error");
    }
  };

  /* =======================
     MAP
  ======================= */
  useEffect(() => {
    if (!showCompare || !mapRef.current || !userLocation) return;

    mapInstance.current?.remove();

    mapInstance.current = L.map(mapRef.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapInstance.current
    );
  }, [showCompare, userLocation]);

  /* =======================
     UI
  ======================= */
  return (
    <div className="sl-container">
      <h2>🛒 Crear mi propia lista</h2>

      <button
        className="create-btn"
        onClick={() => {
          setMode("custom");
          setProducts([]);
          setListName("");
        }}
      >
        ➕ Create My Own List
      </button>

      {mode === "custom" && (
        <>
          <input
            className="list-name-input"
            placeholder="Nombre de la lista"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
          />

          <div className="sl-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
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
        </>
      )}

      {products.length > 0 && (
        <>
          <div className="sl-products">
            {products.map((p, i) => (
              <div key={i} className="sl-item">
                {p.product}
              </div>
            ))}
          </div>

          <button className="compare-btn" onClick={() => setShowCompare(true)}>
            Comparar
          </button>
        </>
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
            </div>
          ))}

          <button className="save-btn" onClick={saveListToProfile}>
            Guardar en Perfil
          </button>

          <div ref={mapRef} className="sl-map" />
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
