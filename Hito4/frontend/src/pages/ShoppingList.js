import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  compareList,
  getShoppingList,
  createShoppingList,
  updateShoppingList,
} from "../api/shoppingLists";
import { PRODUCT_API_BASE } from "../config";
import "../styles/shoppingList.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ShoppingList = () => {
  const query = useQuery();

  // ============================
  // STATE
  // ============================
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [items, setItems] = useState([{ name: "leche", quantity: 1 }]);

  const [result, setResult] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [currentListId, setCurrentListId] = useState(null);
  const [listNameForEdit, setListNameForEdit] = useState("");

  // ============================
  // LOAD LIST FROM URL
  // ============================
  useEffect(() => {
    const listId = query.get("listId");
    if (!listId) return;

    (async () => {
      try {
        const list = await getShoppingList(listId);
        setItems(
          list.items?.length
            ? list.items.map((i) => ({
                name: i.name,
                quantity: i.quantity || 1,
              }))
            : [{ name: "leche", quantity: 1 }]
        );
        setCurrentListId(list.id);
        setListNameForEdit(list.name || "");
      } catch (err) {
        console.error("Load list error:", err);
      }
    })();
  }, [query]);

  // ============================
  // AUTOCOMPLETE (PREFIX ONLY)
  // ============================
  const fetchSuggestions = async (text) => {
    const value = text.trim().toLowerCase();
    if (value.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `${PRODUCT_API_BASE}/products/names/${encodeURIComponent(value)}`
      );

      if (!res.ok) return setSuggestions([]);

      const data = await res.json(); // [{ name }]

      // ✅ dedupe + prefix filter
      const unique = [
        ...new Set(
          data
            .map((p) => p.name)
            .filter((name) =>
              name.toLowerCase().startsWith(value)
            )
        ),
      ];

      setSuggestions(unique);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setSuggestions([]);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    fetchSuggestions(value);
  };

  const handleSelectSuggestion = (name) => {
    setSearchTerm(name);
    setSuggestions([]);
  };

  // ============================
  // ITEMS
  // ============================
  const handleAddItem = () => {
    const name = searchTerm.trim();
    if (!name) return;

    setItems((prev) => [...prev, { name, quantity: 1 }]);
    setSearchTerm("");
    setSuggestions([]);
    setError("");
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      if (field === "quantity") {
        const q = parseInt(value, 10);
        copy[index].quantity = isNaN(q) || q < 1 ? 1 : q;
      }
      return copy;
    });
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================
  // COMPARE (FIXED PAYLOAD)
  // ============================
  const handleCompare = async () => {
    setError("");
    setResult(null);

    const normalized = items
      .map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity || 1,
      }))
      .filter((i) => i.name);

    if (!normalized.length) {
      setError("Please add at least one product.");
      return;
    }

    try {
      setLoadingCompare(true);
      const data = await compareList({ products: normalized });
      setResult(data);
    } catch (err) {
      console.error("Compare failed:", err);
      setError(err.message || "Compare failed");
    } finally {
      setLoadingCompare(false);
    }
  };

  // ============================
  // SAVE LIST
  // ============================
  const handleSaveList = async () => {
    if (!result) {
      setError("Compare before saving.");
      return;
    }

    const name = window.prompt(
      "Enter list name:",
      listNameForEdit || "My shopping list"
    );
    if (!name) return;

    const payload = {
      name,
      items: items.map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity || 1,
      })),
    };

    try {
      setSaving(true);
      const saved = currentListId
        ? await updateShoppingList(currentListId, payload)
        : await createShoppingList(payload);

      setCurrentListId(saved.id);
      setListNameForEdit(saved.name);
      alert("List saved!");
    } catch (err) {
      console.error("Save error:", err);
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="list-container">
      <h1 className="list-title">Shopping List</h1>

      {error && <div className="shopping-list-error">{error}</div>}

      {/* SEARCH */}
      <div className="list-input-box">
        <div style={{ position: "relative", flex: 1 }}>
          <input
            className="list-input"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Type product (e.g. leche)"
          />

          {suggestions.length > 0 && (
            <div className="list-suggestions">
              {suggestions.map((s) => (
                <div
                  key={s}
                  className="list-suggestion-item"
                  onClick={() => handleSelectSuggestion(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="list-add-btn" onClick={handleAddItem}>
          + Add
        </button>
      </div>

      {/* ITEMS */}
      <ul className="list-items">
        {items.map((item, i) => (
          <li key={i} className="list-item">
            <span style={{ flex: 1 }}>{item.name}</span>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(i, "quantity", e.target.value)
              }
              style={{ width: "70px" }}
            />

            <button
              className="list-remove-btn"
              onClick={() => handleRemoveItem(i)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* ACTIONS */}
      <button
        className="list-compare-btn"
        onClick={handleCompare}
        disabled={loadingCompare}
      >
        {loadingCompare ? "Comparing..." : "Compare prices"}
      </button>

      <button
        className="list-compare-btn"
        style={{ background: "#007bff" }}
        onClick={handleSaveList}
        disabled={saving || !result}
      >
        {saving ? "Saving..." : "Save list"}
      </button>

      {/* RESULTS */}
      {result && (
        <div className="list-results">
          <h2>Comparison</h2>

          {result.best && (
            <p>
              Best: <strong>{result.best.supermarket}</strong> —{" "}
              <strong>{result.best.total}€</strong>
            </p>
          )}

          <div className="list-grid">
            {result.supermarkets.map((s) => (
              <div key={s.supermarket} className="list-card">
                <h4>{s.supermarket}</h4>
                <p>Total: {s.total}€</p>
                <p>Missing: {s.missing}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
