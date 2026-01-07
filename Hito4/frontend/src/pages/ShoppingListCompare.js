import React, { useEffect, useState } from "react";
import axios from "axios";
import "./shoppingListCompare.css";

const AUTH_API = "https://auth-service-3lsh.onrender.com";
const PRODUCT_API = "https://product-service-3lsh.onrender.com/compare-list";

export default function ShoppingListCompare() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]);
  const [productName, setProductName] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ============================
     Load user shopping lists
  ============================ */
  useEffect(() => {
    fetchLists();
    // eslint-disable-next-line
  }, []);

  const fetchLists = async () => {
    try {
      const res = await axios.get(`${AUTH_API}/shopping-lists`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLists(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch lists:", err);
    }
  };

  /* ============================
     Create new list
  ============================ */
  const createList = async () => {
    if (!listName.trim()) return;

    try {
      const res = await axios.post(
        `${AUTH_API}/shopping-lists`,
        { name: listName, items: [] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLists([res.data, ...lists]);
      setListName("");
    } catch (err) {
      console.error("❌ Create list error:", err);
    }
  };

  /* ============================
     Select list
  ============================ */
  const selectList = (list) => {
    setSelectedList(list);
    setItems(list.items || []);
    setResults(null);
  };

  /* ============================
     Item management
  ============================ */
  const addItem = () => {
    if (!productName.trim()) return;

    setItems([
      ...items,
      {
        name: productName.trim(),
        quantity: 1,
      },
    ]);
    setProductName("");
  };

  const updateQuantity = (index, quantity) => {
    const updated = [...items];
    updated[index].quantity = quantity < 1 ? 1 : quantity;
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /* ============================
     Save list
  ============================ */
  const saveList = async () => {
    if (!selectedList) return;

    try {
      const res = await axios.put(
        `${AUTH_API}/shopping-lists/${selectedList.id}`,
        {
          name: selectedList.name,
          items,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedList(res.data);
      fetchLists();
    } catch (err) {
      console.error("❌ Save list error:", err);
    }
  };

  /* ============================
     Compare prices
  ============================ */
  const comparePrices = async () => {
    if (!items.length) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await axios.post(PRODUCT_API, {
        products: items,
      });

      setResults(res.data);
    } catch (err) {
      console.error("❌ Compare error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shopping-container">
      <h1>🛒 Shopping List Comparison</h1>

      {/* CREATE LIST */}
      <div className="create-list">
        <input
          type="text"
          placeholder="New list name"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
        <button onClick={createList}>Create</button>
      </div>

      {/* LISTS */}
      <div className="lists">
        {lists.map((list) => (
          <div
            key={list.id}
            className={`list-item ${
              selectedList?.id === list.id ? "selected" : ""
            }`}
            onClick={() => selectList(list)}
          >
            {list.name}
          </div>
        ))}
      </div>

      {/* LIST EDITOR */}
      {selectedList && (
        <div className="editor">
          <h2>{selectedList.name}</h2>

          <div className="add-item">
            <input
              type="text"
              placeholder="Product name (e.g. eggs)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <button onClick={addItem}>Add</button>
          </div>

          <div className="items">
            {items.map((item, index) => (
              <div className="item" key={index}>
                <span>{item.name}</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(index, parseInt(e.target.value))
                  }
                />
                <button onClick={() => removeItem(index)}>✕</button>
              </div>
            ))}
          </div>

          <div className="editor-buttons">
            <button className="save-btn" onClick={saveList}>
              Save List
            </button>
            <button className="compare-btn" onClick={comparePrices}>
              Compare Prices
            </button>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {loading && <p className="loading">Comparing prices…</p>}

      {results && (
        <div className="results">
          <h3>🏪 Supermarket Comparison</h3>

          {results.supermarkets.map((s) => (
            <div
              key={s.supermarket}
              className={`market ${
                results.best?.supermarket === s.supermarket ? "best" : ""
              }`}
            >
              <strong>{s.supermarket}</strong> — {s.total} €
              {results.best?.supermarket === s.supermarket && " ✅ Cheapest"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
