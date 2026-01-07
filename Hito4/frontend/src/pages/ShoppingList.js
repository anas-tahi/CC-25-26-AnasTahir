// frontend/src/pages/ShoppingList.js
import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getShoppingLists,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  compareList,
} from "../api/shoppingLists";
import { productAPI } from "../services/api";

const ShoppingList = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [itemsInput, setItemsInput] = useState([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [query, setQuery] = useState("");
  const [compareResults, setCompareResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const mapRef = useRef(null);

  // Fetch lists and user location
  useEffect(() => {
    fetchLists();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
  }, []);

  const fetchLists = async () => {
    const data = await getShoppingLists();
    setLists(data);
  };

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    const list = await createShoppingList({ name: newListName, items: [] });
    setLists((prev) => [...prev, list]);
    setNewListName("");
  };

  const handleDelete = async (id) => {
    await deleteShoppingList(id);
    setLists((prev) => prev.filter((l) => l._id !== id));
    if (selectedList?._id === id) setSelectedList(null);
    setCompareResults(null);
    setGoogleMapsLink("");
  };

  const handleSelectList = (list) => {
    setSelectedList(list);
    setItemsInput(list.items || []);
    setCompareResults(null);
    setGoogleMapsLink("");
    setQuery("");
    setAutocompleteSuggestions([]);
  };

  const handleAutocomplete = async (value) => {
    setQuery(value);
    if (!value.trim()) return;
    try {
      const res = await productAPI.get(`/names/${encodeURIComponent(value)}`);
      setAutocompleteSuggestions(res.data || []);
    } catch (err) {
      console.error("Autocomplete error:", err);
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

  const removeItem = (name) => {
    setItemsInput((prev) => prev.filter((i) => i.name !== name));
  };

  const updateQuantity = (name, qty) => {
    setItemsInput((prev) =>
      prev.map((i) => (i.name === name ? { ...i, quantity: qty } : i))
    );
  };

  const handleUpdate = async () => {
    if (!selectedList) return;
    const updated = await updateShoppingList(selectedList._id, {
      ...selectedList,
      items: itemsInput,
    });
    setLists((prev) =>
      prev.map((l) => (l._id === selectedList._id ? updated : l))
    );
    setSelectedList(updated);
  };

  const handleCompare = async () => {
    if (!selectedList || !itemsInput.length || !userLocation) return;
    setMapLoading(true);
    try {
      const result = await compareList(itemsInput);
      setCompareResults(result);
      if (result?.cheapest) {
        showMap(result.cheapest.supermarket);
      }
    } catch (err) {
      console.error("Compare error:", err);
      setCompareResults(null);
      setMapLoading(false);
    }
  };

  const showMap = (storeName) => {
    if (!mapRef.current) return;
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = "";
    const map = L.map(mapContainer);
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

        map.fitBounds([
          [userLocation.lat, userLocation.lng],
          [storeLat, storeLon],
        ], { padding: [50, 50] });

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
    <div style={styles.page}>
      <h1>Shopping Lists</h1>

      <div style={styles.newList}>
        <input
          type="text"
          placeholder="New list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleCreate} style={styles.button}>
          Create
        </button>
      </div>

      <div style={styles.listsContainer}>
        {lists.map((list) => (
          <div
            key={list._id}
            style={{
              ...styles.listItem,
              ...(selectedList?._id === list._id ? styles.selectedListItem : {}),
            }}
            onClick={() => handleSelectList(list)}
          >
            {list.name}
            <button onClick={() => handleDelete(list._id)} style={styles.deleteBtn}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {selectedList && (
        <div style={styles.editor}>
          <h2>{selectedList.name}</h2>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => handleAutocomplete(e.target.value)}
              placeholder="Add products..."
              style={styles.input}
            />
            {autocompleteSuggestions.length > 0 && (
              <ul style={styles.suggestions}>
                {autocompleteSuggestions.map((s) => (
                  <li key={s} onClick={() => addItem(s)} style={styles.suggestionItem}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={styles.itemsList}>
            {itemsInput.map((i) => (
              <div key={i.name} style={styles.item}>
                <span>{i.name}</span>
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={(e) => updateQuantity(i.name, parseInt(e.target.value))}
                  style={{ width: 50 }}
                />
                <button onClick={() => removeItem(i.name)} style={styles.removeBtn}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleUpdate} style={styles.button}>
            Save
          </button>
          <button onClick={handleCompare} style={styles.button}>
            Compare Total Prices
          </button>
        </div>
      )}

      {compareResults && (
        <div style={styles.compareResults}>
          <h3>Comparison Results:</h3>
          {compareResults.supermarkets.map((s) => (
            <div
              key={s.name}
              style={{
                padding: 10,
                border: "1px solid #ccc",
                marginBottom: 5,
                backgroundColor: s.name === compareResults.cheapest.name ? "#def" : "#fff",
              }}
            >
              {s.name}: <strong>{s.total.toFixed(2)} €</strong>{" "}
              {s.name === compareResults.cheapest.name && "✅ Cheapest"}
            </div>
          ))}

          <div style={{ marginTop: 10 }}>
            {mapLoading && <p>Loading map...</p>}
            <div ref={mapRef} style={{ height: 300, width: "100%" }} />
            {googleMapsLink && (
              <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: 5, display: "inline-block" }}>
                Go to Google Maps 🚀
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: 20, fontFamily: "Arial, sans-serif" },
  newList: { marginBottom: 20, display: "flex", gap: 10 },
  input: { padding: 8, fontSize: 16 },
  button: { padding: "8px 12px", cursor: "pointer", marginTop: 5 },
  listsContainer: { marginBottom: 20 },
  listItem: {
    padding: 10,
    border: "1px solid #ccc",
    marginBottom: 5,
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer",
  },
  selectedListItem: { backgroundColor: "#def" },
  deleteBtn: { marginLeft: 10, cursor: "pointer" },
  editor: { padding: 10, border: "1px solid #aaa", marginBottom: 20 },
  suggestions: {
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
    margin: 0,
  },
  suggestionItem: { padding: 8, cursor: "pointer", borderBottom: "1px solid #eee" },
  itemsList: { marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 },
  item: {
    padding: "5px 10px",
    border: "1px solid #888",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  removeBtn: { cursor: "pointer", background: "none", border: "none", color: "red" },
  compareResults: { marginTop: 20 },
};

export default ShoppingList;
