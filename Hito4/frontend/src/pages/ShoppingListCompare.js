// src/pages/ShoppingListCompare.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./shoppingListCompare.css";


const API_BASE = "https://auth-service-3lsh.onrender.com"; // auth-service backend
const COMPARE_API = "https://product-service-3lsh.onrender.com/compare-list"; // compare-list backend

const ShoppingListCompare = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [itemsInput, setItemsInput] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [compareResults, setCompareResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const mapRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch shopping lists & user location
  useEffect(() => {
    fetchLists();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("User location unavailable")
      );
    }
  }, []);

  const fetchLists = async () => {
    try {
      const res = await axios.get(`${API_BASE}/shopping-lists`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setLists(res.data);
    } catch (err) {
      console.error("Failed to fetch lists:", err);
    }
  };

  // ----------------------------
  // CRUD Shopping List
  // ----------------------------
  const handleCreate = async () => {
    if (!newListName.trim()) return;
    try {
      const res = await axios.post(
        `${API_BASE}/shopping-lists`,
        { name: newListName, items: [] },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setLists((prev) => [res.data, ...prev]);
      setNewListName("");
    } catch (err) {
      console.error("Create list error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/shopping-lists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setLists((prev) => prev.filter((l) => l.id !== id));
      if (selectedList?.id === id) {
        setSelectedList(null);
        setCompareResults(null);
      }
    } catch (err) {
      console.error("Delete list error:", err);
    }
  };

  const handleSelectList = (list) => {
    setSelectedList(list);
    setItemsInput(list.items || []);
    setCompareResults(null);
    setGoogleMapsLink("");
    setQuery("");
    setSuggestions([]);
  };

  const handleUpdate = async () => {
    if (!selectedList) return;
    try {
      const res = await axios.put(
        `${API_BASE}/shopping-lists/${selectedList.id}`,
        { ...selectedList, items: itemsInput },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setLists((prev) => prev.map((l) => (l.id === selectedList.id ? res.data : l)));
      setSelectedList(res.data);
    } catch (err) {
      console.error("Update list error:", err);
    }
  };

  // ----------------------------
  // Autocomplete for products
  // ----------------------------
  const handleAutocomplete = async (value) => {
    setQuery(value);
    if (!value.trim()) return;
    try {
      const res = await axios.get(`${API_BASE}/products/names/${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setSuggestions(res.data || []);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setSuggestions([]);
    }
  };

  const addItem = (name) => {
    if (!itemsInput.find((i) => i.name === name)) {
      setItemsInput((prev) => [...prev, { name, quantity: 1 }]);
    }
    setQuery("");
    setSuggestions([]);
  };

  const removeItem = (name) => {
    setItemsInput((prev) => prev.filter((i) => i.name !== name));
  };

  const updateQuantity = (name, qty) => {
    setItemsInput((prev) =>
      prev.map((i) => (i.name === name ? { ...i, quantity: qty } : i))
    );
  };

  // ----------------------------
  // Compare list prices
  // ----------------------------
  const handleCompare = async () => {
    if (!itemsInput.length || !userLocation) return;
    setMapLoading(true);
    try {
      const res = await axios.post(
        COMPARE_API,
        { products: itemsInput },
        { headers: { "Content-Type": "application/json" } }
      );
      setCompareResults(res.data);
      if (res.data?.best?.supermarket) {
        showMap(res.data.best.supermarket);
      } else {
        setMapLoading(false);
      }
    } catch (err) {
      console.error("Compare error:", err);
      setCompareResults(null);
      setMapLoading(false);
    }
  };

  // ----------------------------
  // Map display
  // ----------------------------
  const showMap = (storeName) => {
    if (!mapRef.current) return;
    const container = mapRef.current;
    container.innerHTML = "";
    const map = L.map(container);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(storeName)}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.length) return setMapLoading(false);
        const storeLat = parseFloat(data[0].lat);
        const storeLon = parseFloat(data[0].lon);

        // Store marker
        L.marker([storeLat, storeLon], {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
            iconSize: [35, 35],
          }),
        })
          .addTo(map)
          .bindPopup(`${storeName} ✅ Cheapest supermarket`)
          .openPopup();

        // User marker
        L.marker([userLocation.lat, userLocation.lng], {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
            iconSize: [35, 35],
          }),
        })
          .addTo(map)
          .bindPopup("You are here");

        map.fitBounds(
          [
            [userLocation.lat, userLocation.lng],
            [storeLat, storeLon],
          ],
          { padding: [50, 50] }
        );

        // Google Maps link
        setGoogleMapsLink(
          `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${storeLat},${storeLon}`
        );
        setMapLoading(false);
      })
      .catch((err) => {
        console.error("Map error:", err);
        setMapLoading(false);
      });
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Shopping Lists</h1>

      {/* Create new list */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="New list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          style={{ padding: 8, fontSize: 16 }}
        />
        <button onClick={handleCreate} style={{ padding: "8px 12px", cursor: "pointer" }}>
          Create
        </button>
      </div>

      {/* Lists */}
      <div style={{ marginBottom: 20 }}>
        {lists.map((list) => (
          <div
            key={list.id}
            style={{
              padding: 10,
              border: "1px solid #ccc",
              marginBottom: 5,
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer",
              backgroundColor: selectedList?.id === list.id ? "#def" : "#fff",
            }}
            onClick={() => handleSelectList(list)}
          >
            {list.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(list.id);
              }}
              style={{ cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Selected list editor */}
      {selectedList && (
        <div style={{ padding: 10, border: "1px solid #aaa", marginBottom: 20 }}>
          <h2>{selectedList.name}</h2>

          {/* Add item */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => handleAutocomplete(e.target.value)}
              placeholder="Add products..."
              style={{ padding: 8, fontSize: 16 }}
            />
            {suggestions.length > 0 && (
              <ul style={{
                position: "absolute",
                top: 36,
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ccc",
                maxHeight: 150,
                overflowY: "auto",
                zIndex: 10,
                listStyle: "none",
                padding: 0,
                margin: 0
              }}>
                {suggestions.map((s) => (
                  <li
                    key={s}
                    onClick={() => addItem(s)}
                    style={{ padding: 8, cursor: "pointer", borderBottom: "1px solid #eee" }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Items list */}
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
            {itemsInput.map((i) => (
              <div key={i.name} style={{
                padding: "5px 10px",
                border: "1px solid #888",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 5
              }}>
                <span>{i.name}</span>
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={(e) => updateQuantity(i.name, parseInt(e.target.value))}
                  style={{ width: 50 }}
                />
                <button
                  onClick={() => removeItem(i.name)}
                  style={{ cursor: "pointer", background: "none", border: "none", color: "red" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleUpdate} style={{ padding: "8px 12px", marginTop: 5, cursor: "pointer" }}>
            Save
          </button>
          <button onClick={handleCompare} style={{ padding: "8px 12px", marginLeft: 10, cursor: "pointer" }}>
            Compare Total Prices
          </button>
        </div>
      )}

      {/* Comparison results */}
      {compareResults && (
        <div style={{ marginTop: 20 }}>
          <h3>Comparison Results:</h3>
          {compareResults.supermarkets.map((s) => (
            <div
              key={s.supermarket}
              style={{
                padding: 10,
                border: "1px solid #ccc",
                marginBottom: 5,
                backgroundColor: s.supermarket === compareResults.best?.supermarket ? "#def" : "#fff",
              }}
            >
              {s.supermarket}: <strong>{s.total.toFixed(2)} €</strong>{" "}
              {s.supermarket === compareResults.best?.supermarket && "✅ Cheapest"}
            </div>
          ))}

          <div style={{ marginTop: 10 }}>
            {mapLoading && <p>Loading map...</p>}
            <div ref={mapRef} style={{ height: 300, width: "100%" }} />
            {googleMapsLink && (
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 5, display: "inline-block" }}
              >
                Go to Google Maps 🚀
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
