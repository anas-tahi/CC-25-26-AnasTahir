import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ShoppingListCompare.css";

const AUTH_API = "https://auth-service-3lsh.onrender.com";
const PRODUCT_API = "https://product-service-3lsh.onrender.com/compare-list";

export default function ShoppingListCompare() {
  const [lists, setLists] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [product, setProduct] = useState("");
  const [results, setResults] = useState(null);

  const token = localStorage.getItem("token");

  /* ============================
     Load user lists
  ============================ */
  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await axios.get(`${AUTH_API}/shopping-lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLists(res.data);
    } catch (err) {
      console.error("Failed to fetch lists:", err);
    }
  };

  /* ============================
     Create list
  ============================ */
  const createList = async () => {
    if (!name.trim()) return;

    try {
      const res = await axios.post(
        `${AUTH_API}/shopping-lists`,
        { name, items: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLists([res.data, ...lists]);
      setName("");
    } catch (err) {
      console.error("Create list error:", err);
    }
  };

  /* ============================
     Select list
  ============================ */
  const selectList = (list) => {
    setSelected(list);
    setItems(list.items || []);
    setResults(null);
  };

  /* ============================
     Add / remove items
  ============================ */
  const addItem = () => {
    if (!product.trim()) return;

    setItems([...items, { name: product, quantity: 1 }]);
    setProduct("");
  };

  const updateQty = (index, qty) => {
    const updated = [...items];
    updated[index].quantity = qty;
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /* ============================
     Save list
  ============================ */
  const saveList = async () => {
    try {
      const res = await axios.put(
        `${AUTH_API}/shopping-lists/${selected.id}`,
        { name: selected.name, items },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelected(res.data);
      fetchLists();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  /* ============================
     Compare prices
  ============================ */
  const compare = async () => {
    try {
      const res = await axios.post(PRODUCT_API, {
        products: items,
      });

      setResults(res.data);
    } catch (err) {
      console.error("Compare error:", err);
    }
  };

  return (
    <div className="shopping-container">
      <h1>🛒 Shopping Lists</h1>

      {/* Create list */}
      <div className="create-list">
        <input
          placeholder="New list name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createList}>Create</button>
      </div>

      {/* Lists */}
      <div className="lists">
        {lists.map((l) => (
          <div
            key={l.id}
            className={`list-item ${selected?.id === l.id ? "selected" : ""}`}
            onClick={() => selectList(l)}
          >
            {l.name}
          </div>
        ))}
      </div>

      {/* Editor */}
      {selected && (
        <div className="editor">
          <h2>{selected.name}</h2>

          <div className="add-item">
            <input
              placeholder="Product name"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
            <button onClick={addItem}>Add</button>
          </div>

          <div className="items">
            {items.map((i, idx) => (
              <div className="item" key={idx}>
                {i.name}
                <input
                  type="number"
                  min="1"
                  value={i.quantity}
                  onChange={(e) =>
                    updateQty(idx, parseInt(e.target.value))
                  }
                />
                <button onClick={() => removeItem(idx)}>✕</button>
              </div>
            ))}
          </div>

          <div className="editor-buttons">
            <button className="save-btn" onClick={saveList}>
              Save
            </button>
            <button className="compare-btn" onClick={compare}>
              Compare Prices
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="results">
          <h3>🏪 Price Comparison</h3>
          {results.supermarkets.map((s) => (
            <div
              key={s.supermarket}
              className={`market ${
                results.best?.supermarket === s.supermarket ? "best" : ""
              }`}
            >
              {s.supermarket}: <strong>{s.total} €</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
