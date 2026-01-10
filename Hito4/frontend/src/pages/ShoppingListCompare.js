import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { productAPI } from "../services/api";
import "./ShoppingListCompare.css";

const RECOMMENDED = {
  student: [
    {
      name: "Lista Básica Estudiante",
      items: ["Leche", "Pan", "Huevos", "Arroz", "Pasta"],
    },
    {
      name: "Snacks para Estudiantes",
      items: ["Patatas", "Galletas", "Chocolate"],
    },
  ],
  family: [
    {
      name: "Lista Familiar Semanal",
      items: ["Pollo", "Aceite", "Verduras", "Azúcar", "Harina"],
    },
  ],
};

const ShoppingListCompare = () => {
  const token = localStorage.getItem("token");

  const [mode, setMode] = useState("");
  const [listName, setListName] = useState("");
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // ================= LOCATION =================
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

  // ================= AUTOCOMPLETE =================
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

  // ================= ADD PRODUCT =================
  const addProduct = async (name) => {
    if (!name || products.find((p) => p.product === name)) return;

    try {
      const res = await productAPI.get(`/compare/${name}`);
      setProducts((prev) => [...prev, res.data]);
      setQuery("");
      setSuggestions([]);
    } catch {
      Swal.fire("Error", "Producto no encontrado", "error");
    }
  };

  // ================= LOAD RECOMMENDED =================
  const loadRecommended = async (list) => {
    setProducts([]);
    setShowCompare(false);
    setListName(list.name);

    const fetched = [];
    for (const item of list.items) {
      try {
        const res = await productAPI.get(`/compare/${item}`);
        fetched.push(res.data);
      } catch {}
    }
    setProducts(fetched);
  };

  // ================= COMPARE TOTALS =================
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

  // ================= SAVE LIST =================
  const saveList = async () => {
    if (!listName.trim()) {
      Swal.fire("Error", "Pon un nombre a la lista", "warning");
      return;
    }

    const items = products.map((p) => p.product);

    try {
      await axios.post(
        "https://auth-service-a73r.onrender.com/shopping-lists",
        { name: listName, items },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Guardado", "Lista añadida a tu perfil ❤️", "success");
    } catch {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  // ================= MAP =================
  useEffect(() => {
    if (!showCompare || !userLocation || !mapRef.current) return;

    mapInstance.current?.remove();

    mapInstance.current = L.map(mapRef.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapInstance.current
    );

    L.marker([userLocation.lat, userLocation.lng])
      .addTo(mapInstance.current)
      .bindPopup("Tú estás aquí");

    return () => mapInstance.current?.remove();
  }, [showCompare, userLocation]);

  return (
    <div className="sl-container">
      <h2>🛒 Lista de Compra</h2>

      {/* MODES */}
      <div className="sl-modes">
        <button onClick={() => setMode("student")}>Estudiantes</button>
        <button onClick={() => setMode("family")}>Familias</button>
        <button onClick={() => setMode("custom")}>Crear Mi Propia Lista</button>
      </div>

      {/* RECOMMENDED */}
      {(mode === "student" || mode === "family") && (
        <div className="sl-recommended">
          {RECOMMENDED[mode].map((l, i) => (
            <div key={i} className="sl-card">
              <h4>{l.name}</h4>
              <p>{l.items.join(", ")}</p>
              <button onClick={() => loadRecommended(l)}>Usar</button>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOM LIST */}
      {mode === "custom" && (
        <input
          className="list-name-input"
          placeholder="Nombre de la lista"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
      )}

      {/* SEARCH */}
      {(mode === "custom" || products.length > 0) && (
        <div className="sl-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
          />
          <button onClick={() => addProduct(query)}>Añadir</button>

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

      {/* PRODUCTS */}
      {products.length > 0 && (
        <div className="sl-products">
          {products.map((p, i) => (
            <div key={i}>{p.product}</div>
          ))}

          <button className="compare-btn" onClick={() => setShowCompare(true)}>
            Comparar
          </button>
        </div>
      )}

      {/* RESULTS */}
      {showCompare && (
        <div className="sl-results">
          {Object.keys(totals).map((m) => (
            <div key={m} className={m === cheapestMarket ? "best" : ""}>
              {m}: €{totals[m].toFixed(2)}
            </div>
          ))}

          <button className="save-btn" onClick={saveList}>
            Guardar en Perfil
          </button>

          <div ref={mapRef} className="sl-map" />
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
