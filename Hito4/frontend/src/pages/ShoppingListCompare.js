import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { productAPI } from "../services/api"; // your product service
import React from "react";
import "./shoppingListCompare.css";


const ShoppingListCompare = () => {
  const token = localStorage.getItem("token");
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [itemsInput, setItemsInput] = useState([]);
  const [query, setQuery] = useState("");
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [compareResults, setCompareResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const mapRef = useRef(null);

  // Load shopping lists & user location
  useEffect(() => {
    fetchLists();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
  }, []);

  const fetchLists = async () => {
    const res = await axios.get("https://auth-service-3lsh.onrender.com/shopping-lists", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLists(res.data);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    const res = await axios.post(
      "https://auth-service-3lsh.onrender.com/shopping-lists",
      { name: newListName, items: [] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLists((prev) => [res.data, ...prev]);
    setSelectedList(res.data);
    setItemsInput([]);
    setNewListName("");
    setCompareResults(null);
  };

  const handleSelectList = (list) => {
    setSelectedList(list);
    setItemsInput(list.items || []);
    setCompareResults(null);
  };

  const handleAutocomplete = async (value) => {
    setQuery(value);
    if (!value.trim()) return;
    try {
      const res = await productAPI.get(`/names/${encodeURIComponent(value)}`);
      setAutocompleteSuggestions(res.data || []);
    } catch (err) {
      setAutocompleteSuggestions([]);
    }
  };

  const addItem = (name) => {
    if (!itemsInput.find((i) => i.name === name)) {
      setItemsInput((prev) => [...prev, { name, quantity: 1 }]);
    }
    setQuery("");
    setAutocompleteSuggestions([]);
  };

  const removeItem = (name) => setItemsInput(itemsInput.filter((i) => i.name !== name));

  const updateQuantity = (name, qty) => {
    setItemsInput(itemsInput.map((i) => (i.name === name ? { ...i, quantity: qty } : i)));
  };

  const handleSaveList = async () => {
    if (!selectedList) return;
    const res = await axios.put(
      `https://auth-service-3lsh.onrender.com/shopping-lists/${selectedList.id}`,
      { name: selectedList.name, items: itemsInput },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLists(lists.map((l) => (l.id === selectedList.id ? res.data : l)));
    setSelectedList(res.data);
  };

  const handleCompare = async () => {
    if (!itemsInput.length) return;
    setMapLoading(true);
    try {
      const res = await axios.post(
        "https://product-service-3lsh.onrender.com/compare-list",
        { products: itemsInput }
      );
      setCompareResults(res.data);
      if (res.data.best) showMap(res.data.best.supermarket);
    } catch (err) {
      console.error(err);
      setCompareResults(null);
      setMapLoading(false);
    }
  };

  const showMap = (storeName) => {
    if (!mapRef.current) return;
    mapRef.current.innerHTML = "";
    const map = L.map(mapRef.current);
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
        L.marker([storeLat, storeLon], { icon: L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png", iconSize: [35, 35] }) })
          .addTo(map)
          .bindPopup(`${storeName} ✅ Cheapest supermarket`)
          .openPopup();

        // User marker
        if (userLocation) {
          L.marker([userLocation.lat, userLocation.lng], { icon: L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png", iconSize: [35, 35] }) })
            .addTo(map)
            .bindPopup("You are here");
          map.fitBounds([[userLocation.lat, userLocation.lng], [storeLat, storeLon]], { padding: [50, 50] });
          setGoogleMapsLink(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${storeLat},${storeLon}`);
        }

        setMapLoading(false);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create & Compare Shopping Lists</h1>

      {/* Create new list */}
      <div>
        <input type="text" placeholder="New list name" value={newListName} onChange={(e) => setNewListName(e.target.value)} />
        <button onClick={handleCreateList}>Create List</button>
      </div>

      {/* Existing lists */}
      <div style={{ marginTop: 20 }}>
        {lists.map((list) => (
          <div key={list.id} style={{ padding: 5, border: "1px solid #ccc", marginBottom: 5, cursor: "pointer", background: selectedList?.id === list.id ? "#def" : "#fff" }} onClick={() => handleSelectList(list)}>
            {list.name}
          </div>
        ))}
      </div>

      {/* Selected list editor */}
      {selectedList && (
        <div style={{ marginTop: 20, border: "1px solid #aaa", padding: 10 }}>
          <h2>{selectedList.name}</h2>
          <div style={{ position: "relative" }}>
            <input type="text" placeholder="Add product..." value={query} onChange={(e) => handleAutocomplete(e.target.value)} />
            {autocompleteSuggestions.length > 0 && (
              <ul style={{ position: "absolute", top: 30, left: 0, right: 0, background: "#fff", border: "1px solid #ccc" }}>
                {autocompleteSuggestions.map((s) => (
                  <li key={s} onClick={() => addItem(s)}>{s}</li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            {itemsInput.map((i) => (
              <div key={i.name} style={{ marginBottom: 5 }}>
                {i.name} <input type="number" min={1} value={i.quantity} onChange={(e) => updateQuantity(i.name, parseInt(e.target.value))} /> <button onClick={() => removeItem(i.name)}>✕</button>
              </div>
            ))}
          </div>

          <button onClick={handleSaveList}>Save List</button>
          <button onClick={handleCompare} style={{ marginLeft: 10 }}>Compare Total Prices</button>
        </div>
      )}

      {/* Compare results */}
      {compareResults && (
        <div style={{ marginTop: 20 }}>
          <h3>Comparison Results:</h3>
          {compareResults.supermarkets.map((s) => (
            <div key={s.supermarket} style={{ padding: 5, border: "1px solid #ccc", marginBottom: 5, background: s.supermarket === compareResults.best.supermarket ? "#def" : "#fff" }}>
              {s.supermarket}: {s.total.toFixed(2)} € {s.supermarket === compareResults.best.supermarket && "✅ Cheapest"}
            </div>
          ))}
          <div style={{ height: 300, marginTop: 10 }} ref={mapRef}></div>
          {googleMapsLink && <a href={googleMapsLink} target="_blank">Go to Google Maps 🚀</a>}
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
