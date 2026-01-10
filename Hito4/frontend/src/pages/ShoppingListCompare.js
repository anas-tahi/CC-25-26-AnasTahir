import { useState, useEffect, useRef, useContext } from "react";
import { productAPI } from "../services/api";
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ShoppingListCompare.css";
import { FavoritesContext } from "../context/FavoritesContext";

// Recommended lists (read-only)
const recommendedLists = {
  student: [
    { name: "Lista Básica Estudiante", items: ["Leche", "Pan", "Huevos", "Cereal", "Jugo"] },
    { name: "Snacks para Estudiantes", items: ["Chips", "Chocolate", "Galletas", "Refresco", "Frutos Secos"] },
  ],
  family: [
    { name: "Lista Semanal Familiar", items: ["Arroz", "Pasta", "Pollo", "Salsa de Tomate", "Queso"] },
    { name: "Snacks y Bebidas Familiar", items: ["Jugo", "Yogur", "Galletas", "Cereal", "Refresco"] },
  ],
};

const ShoppingListCompare = () => {
  const [mode, setMode] = useState(""); // student | family | custom
  const [selectedList, setSelectedList] = useState(null);
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

  /* ========= AUTOCOMPLETE (custom lists only) ========= */
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

  /* ========= ADD PRODUCT ========= */
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

  /* ========= SELECT RECOMMENDED LIST ========= */
  const selectRecommendedList = async (list) => {
    setSelectedList(list);
    setProducts([]); // clear previous
    setShowCompare(false);

    const fetchedProducts = [];
    for (const name of list.items) {
      try {
        const res = await productAPI.get(`/compare/${name}`);
        fetchedProducts.push(res.data);
      } catch {
        console.warn(`Producto ${name} no encontrado`);
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

  /* ========= SAVE LIST ========= */
  const saveListToProfile = async () => {
    if (!products.length) return;

    const itemsAsStrings = products.map((p) => {
      if (!cheapestMarket) return p.product;
      const cheapest = p.supermarkets.find(
        (s) => s.supermarket === cheapestMarket
      );
      return `${p.product} - ${cheapest.supermarket} (€${cheapest.price.toFixed(2)})`;
    });

    try {
      await axios.post(
        "https://auth-service-a73r.onrender.com/shopping-lists",
        {
          name: selectedList ? selectedList.name : "Mi Lista Personal",
          items: itemsAsStrings,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Guardado", "Lista agregada a tu perfil ❤️", "success");
      fetchFavoritesCount();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar la lista.", "error");
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
      <h2>🛒 Comparar Precios</h2>

      {/* MODE BUTTONS */}
      <div className="sl-modes">
        <button onClick={() => { setMode("student"); setSelectedList(null); setProducts([]); }}>
          Listas para Estudiantes
        </button>
        <button onClick={() => { setMode("family"); setSelectedList(null); setProducts([]); }}>
          Listas para Familias
        </button>
        <button onClick={() => { setMode("custom"); setSelectedList(null); setProducts([]); }}>
          Crear Mi Propia Lista
        </button>
      </div>

      {/* RECOMMENDED LISTS (read-only) */}
      {(mode === "student" || mode === "family") && (
        <div className="sl-recommended-lists">
          {recommendedLists[mode].map((l, i) => (
            <div key={i} className="sl-recommended-item">
              <span>{l.name}</span>
              <button onClick={() => selectRecommendedList(l)}>Ver</button>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH / CUSTOM LIST */}
      {(mode === "custom" || products.length > 0) && (
        <div className="sl-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
          />
          <button onClick={() => addProduct(query)}>Agregar</button>

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

      {/* PRODUCTS LIST */}
      {products.length > 0 && (
        <div className="sl-products">
          {products.map((p, i) => (
            <div key={i} className="sl-item">
              {p.product}
            </div>
          ))}

          <button className="compare-btn" onClick={() => setShowCompare(true)}>
            Comparar
          </button>
        </div>
      )}

      {/* COMPARE RESULTS */}
      {showCompare && (
        <div className="sl-results">
          <h3>Totales por Supermercado</h3>

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
            Guardar Lista en Perfil
          </button>

          <div ref={mapRef} className="sl-map" />
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
