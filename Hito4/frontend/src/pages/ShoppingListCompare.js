// src/pages/ShoppingListCompare.jsx
import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { productAPI } from "../services/api";
import { authAPI } from "../services/api";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../context/ThemeContext";

import "./ShoppingListCompare.css";

const RECOMMENDED = {
  student: [
    { name: "Lista Básica Estudiante", items: ["Leche", "Pan", "Huevos", "Arroz", "Pasta"] },
    { name: "Snacks para Estudiantes", items: ["Patatas", "Galletas", "Chocolate"] },
  ],
  family: [
    { name: "Lista Familiar Semanal", items: ["Pollo", "Aceite", "Verduras", "Azúcar", "Harina"] },
  ],
};

const ShoppingListCompare = () => {
  const { t } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);

  const token = localStorage.getItem("token");
  const [mode, setMode] = useState("");
  const [listName, setListName] = useState("");
  const [loadedListId, setLoadedListId] = useState(null);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // ================= LOCATION =================
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null)
    );
  }, []);
  
  // ================= LOAD LIST FOR EDIT =================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadId = params.get('load');
    if (loadId) {
      setLoadedListId(loadId);
      authAPI.get(`/shopping-lists/${loadId}`).then(async (res) => {
        const list = res.data;
        setListName(list.name);
        setMode('custom');
        setProducts([]);
        const fetched = [];
        for (const item of list.items) {
          try {
            const res = await productAPI.get(`/compare/${item}`);
            fetched.push(res.data);
          } catch (err) {
            console.error('Failed to load product', item, err);
          }
        }
        setProducts(fetched);
      }).catch((err) => {
        console.error('Failed to load list', err);
        Swal.fire("Error", "Failed to load list", "error");
      });
    }
  }, []);

  // ================= DELETE PRODUCT =================
  const deleteProduct = (index) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  // ================= AUTOCOMPLETE =================
  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);
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
    p.supermarkets.forEach((s) => (totals[s.supermarket] = (totals[s.supermarket] || 0) + s.price))
  );
  const cheapestMarket =
    Object.keys(totals).length > 0
      ? Object.keys(totals).reduce((a, b) => (totals[a] < totals[b] ? a : b))
      : null;

  // ================= SAVE LIST =================
  const saveList = async () => {
    if (!listName.trim()) return Swal.fire("Error", "Pon un nombre a la lista", "warning");
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
    markersRef.current = [];

    mapInstance.current = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);

    // USER LOCATION MARKER
    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    })
      .addTo(mapInstance.current)
      .bindPopup("Tú estás aquí");
    markersRef.current.push(userMarker);

    // CHEAPEST SUPERMARKET MARKERS
    if (cheapestMarket) {
      products.forEach((p) => {
        const cheapestStore = p.supermarkets.find((s) => s.supermarket === cheapestMarket);
        if (cheapestStore && cheapestStore.lat && cheapestStore.lng) {
          const marker = L.marker([cheapestStore.lat, cheapestStore.lng], {
            icon: L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/34/34568.png",
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            }),
          })
            .addTo(mapInstance.current)
            .bindPopup(`${cheapestStore.supermarket}: €${cheapestStore.price.toFixed(2)}`);
          markersRef.current.push(marker);
        }
      });
    }

    return () => mapInstance.current?.remove();
  }, [showCompare, userLocation, products, cheapestMarket]);

  return (
    <div className={`sl-container ${theme}`}>
      <h2>🛒 {t("shoppingLists")}</h2>

      {/* MODES */}
      <div className="sl-modes">
        <button onClick={() => setMode("student")}>{t("students")}</button>
        <button onClick={() => setMode("family")}>{t("families")}</button>
        <button onClick={() => setMode("custom")}>{t("customList")}</button>
      </div>

      {/* RECOMMENDED LISTS */}
      {(mode === "student" || mode === "family") && (
        <div className="sl-recommended">
          {RECOMMENDED[mode].map((l, i) => (
            <div key={i} className="sl-card">
              <h4>{l.name}</h4>
              <p>{l.items.join(", ")}</p>
              <button onClick={() => loadRecommended(l)}>{t("useList")}</button>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOM LIST INPUT */}
      {mode === "custom" && (
        <input
          className="list-name-input"
          placeholder={t("listName")}
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
      )}

      {/* SEARCH PRODUCTS */}
      {(mode === "custom" || products.length > 0) && (
        <div className="search-container">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchProduct")}
            className="search-input"
            onKeyDown={(e) => e.key === "Enter" && addProduct(query)}
          />
          <button className="search-btn" onClick={() => addProduct(query)}>
            {t("add")}
          </button>

          {suggestions.length > 0 && (
            <ul className="suggestions-list">
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
            <div key={i} className="sl-item">
              {p.product}
              <button onClick={() => deleteProduct(i)} className="delete-btn">🗑️</button>
            </div>
          ))}
          <button className="compare-btn" onClick={() => setShowCompare(true)}>
            {t("compare")}
          </button>
        </div>
      )}

      {/* RESULTS + MAP */}
      {showCompare && (
        <div className="sl-results">
          {Object.keys(totals).map((m) => (
            <div key={m} className={`sl-total ${m === cheapestMarket ? "best" : ""}`}>
              {m}: €{totals[m].toFixed(2)}
            </div>
          ))}

          <button className="save-btn" onClick={saveList}>
            {t("saveProfile")}
          </button>

          <div ref={mapRef} className="sl-map" />
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
