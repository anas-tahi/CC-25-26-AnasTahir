import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  compareList,
  getShoppingList,
  getShoppingLists,  // included now!
  createShoppingList,
  updateShoppingList,
} from "../api/shoppingLists";
import { PRODUCT_API_BASE, SHOPPING_API_BASE } from "../config";
import "../styles/shoppingList.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ShoppingList = () => {
  const query = useQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [items, setItems] = useState([{ name: "leche", quantity: 1 }]);
  const [result, setResult] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentListId, setCurrentListId] = useState(null);
  const [listNameForEdit, setListNameForEdit] = useState("");

  // Load list from URL
  useEffect(() => {
    const listId = query.get("listId");
    if (!listId) return;

    (async () => {
      try {
        const list = await getShoppingList(listId);
        setItems(
          list.items && list.items.length > 0
            ? list.items.map((i) => ({
                name: i.name,
                quantity: i.quantity || 1,
              }))
            : [{ name: "leche", quantity: 1 }]
        );
        setCurrentListId(list.id);
        setListNameForEdit(list.name || "");
      } catch (err) {
        console.error("Error loading list:", err);
      }
    })();
  }, [query]);

  // ============================
  // AUTOCOMPLETE
  // ============================
  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `${PRODUCT_API_BASE}/products/names/${encodeURIComponent(text)}`
      );

      if (!res.ok) {
        setSuggestions([]);
        return;
      }

      const data = await res.json(); // [{ name }]
      const filtered = data
        .map((d) => d.name)
        .filter((n) => n.toLowerCase().startsWith(text.toLowerCase()));

      // Remove duplicates
      const unique = [...new Set(filtered)];
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
  // ADD / REMOVE ITEMS
  // ============================
  const handleAddItem = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setItems((prev) => [...prev, { name: trimmed, quantity: 1 }]);
    setSearchTerm("");
    setSuggestions([]);
    setError("");
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === "quantity") {
      const num = parseInt(value, 10);
      updated[index].quantity = isNaN(num) || num < 1 ? 1 : num;
    } else {
      updated[index].name = value;
    }
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================
  // COMPARE
  // ============================
  const handleCompare = async () => {
    setError("");
    setResult(null);

    const normalized = items
      .map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity || 1,
      }))
      .filter((item) => item.name);

    if (normalized.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    try {
      setLoadingCompare(true);
      const data = await compareList(normalized);
      setResult(data);
    } catch (err) {
      console.error("Compare error:", err);
      setError("Compare failed");
    } finally {
      setLoadingCompare(false);
    }
  };

  // ============================
  // SAVE LIST
  // ============================
  const handleSaveList = async () => {
    setError("");
    if (!result) {
      setError("Compare the list before saving.");
      return;
    }

    const defaultName = listNameForEdit || "My shopping list";
    const name = window.prompt("Enter a name for this list:", defaultName);
    if (!name) return;

    const normalized = items
      .map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity || 1,
      }))
      .filter((item) => item.name);

    try {
      setSaving(true);
      let saved;
      if (currentListId) {
        saved = await updateShoppingList(currentListId, {
          name,
          items: normalized,
        });
      } else {
        saved = await createShoppingList({ name, items: normalized });
      }
      setCurrentListId(saved.id);
      setListNameForEdit(saved.name);
      alert("List saved!");
    } catch (err) {
      console.error("Save error:", err);
      setError("Error saving list.");
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // SAVE BEST CHEAPEST
  // ============================
  const handleSaveBest = async (supermarket) => {
    const name = window.prompt(
      `Save this list (cheapest: ${supermarket})`,
      "Cheapest list"
    );
    if (!name) return;

    const normalized = items
      .map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity || 1,
      }))
      .filter((item) => item.name);

    try {
      await createShoppingList({ name, items: normalized });
      alert("List saved!");
    } catch (err) {
      console.error("Save best error:", err);
      alert("Error saving list");
    }
  };

  return (
    <div className="list-container">
      <h1 className="list-title">Shopping List</h1>

      {error && <div className="shopping-list-error">{error}</div>}

      {/* SEARCH + ADD */}
      <div className="list-input-box">
        <div style={{ position: "relative", flex: 1 }}>
          <input
            className="list-input"
            type="text"
            placeholder="Type a product (e.g. leche, pan...)"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          {suggestions.length > 0 && (
            <div className="list-suggestions">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="list-suggestion-item"
                  onClick={() => handleSelectSuggestion(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="list-add-btn" onClick={handleAddItem}>
          + Add item
        </button>
      </div>

      {/* ITEMS */}
      <ul className="list-items">
        {items.map((item, index) => (
          <li key={index} className="list-item">
            <span style={{ flex: 1, marginRight: "0.5rem" }}>{item.name}</span>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
              style={{
                width: "70px",
                marginRight: "0.5rem",
                borderRadius: "8px",
                border: "1px solid var(--border-light)",
                padding: "0.25rem 0.5rem",
              }}
            />

            <button
              type="button"
              className="list-remove-btn"
              onClick={() => handleRemoveItem(index)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* COMPARE + SAVE */}
      <button
        type="button"
        className="list-compare-btn"
        onClick={handleCompare}
        disabled={loadingCompare}
      >
        {loadingCompare ? "Comparing..." : "Compare prices"}
      </button>

      <button
        type="button"
        onClick={handleSaveList}
        disabled={saving || !result}
        className="list-compare-btn"
        style={{ marginTop: "0.8rem", background: "#007bff" }}
      >
        {saving ? "Saving..." : "Save this list"}
      </button>

      {/* RESULTS */}
      {result && (
        <div className="list-results">
          <h2>Comparison</h2>

          {result.best ? (
            <p>
              Best supermarket: <strong>{result.best.supermarket}</strong> — total:{" "}
              <strong>{result.best.total}€</strong> — missing items:{" "}
              <strong>{result.best.missing}</strong>
            </p>
          ) : (
            <p>No supermarkets found.</p>
          )}

          <div className="list-grid">
            {result.supermarkets &&
              result.supermarkets.map((s) => (
                <div key={s.supermarket} className="list-card">
                  <h4>
                    {s.supermarket}
                    {result.best &&
                      result.best.supermarket === s.supermarket && (
                        <span
                          className="heart"
                          onClick={() => handleSaveBest(s.supermarket)}
                        >
                          ❤️
                        </span>
                      )}
                  </h4>
                  <p>Total: {s.total}€</p>
                  <p>Missing items: {s.missing}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
