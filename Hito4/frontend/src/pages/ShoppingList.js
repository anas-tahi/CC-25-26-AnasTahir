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

  const [items, setItems] = useState([{ name: "", quantity: 1 }]);

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
            : [{ name: "", quantity: 1 }]
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
      const unique = [...new Set(data.map((d) => d.name))];

      setSuggestions(unique);
    } catch {
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
    setItems((prev) => {
      const updated = [...prev];
      if (field === "quantity") {
        const num = parseInt(value, 10);
        updated[index].quantity = isNaN(num) || num < 1 ? 1 : num;
      } else {
        updated[index].name = value;
      }
      return updated;
    });
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
      console.error("Compare error:", err);
      setError(err.message || "Compare failed");
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

    const name = window.prompt(
      "Enter a name for this list:",
      listNameForEdit || "My shopping list"
    );
    if (!name) return;

    const normalized = items
      .map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity || 1,
      }))
      .filter((i) => i.name);

    try {
      setSaving(true);

      const saved = currentListId
        ? await updateShoppingList(currentListId, { name, items: normalized })
        : await createShoppingList({ name, items: normalized });

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
  // SAVE CHEAPEST ❤️
  // ============================
  const handleSaveBest = async (supermarket) => {
    const name = window.prompt(
      `Save cheapest list (${supermarket})`,
      "Cheapest list"
    );
    if (!name) return;

    const normalized = items
      .map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity || 1,
      }))
      .filter((i) => i.name);

    try {
      await createShoppingList({ name, items: normalized });
      alert("List saved!");
    } catch {
      alert("Error saving list");
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
              className="qty-input"
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

      <button
        className="list-compare-btn"
        onClick={handleCompare}
        disabled={loadingCompare}
      >
        {loadingCompare ? "Comparing..." : "Compare prices"}
      </button>

      <button
        className="list-compare-btn save-btn"
        onClick={handleSaveList}
        disabled={!result || saving}
      >
        {saving ? "Saving..." : "Save list"}
      </button>

      {/* RESULTS */}
      {result && (
        <div className="list-results">
          <h2>Comparison</h2>

          {result.best && (
            <p>
              Best supermarket: <strong>{result.best.supermarket}</strong> —{" "}
              <strong>{result.best.total}€</strong>
            </p>
          )}

          <div className="list-grid">
            {result.supermarkets.map((s) => (
              <div key={s.supermarket} className="list-card">
                <h4>
                  {s.supermarket}
                  {result.best?.supermarket === s.supermarket && (
                    <span
                      className="heart"
                      onClick={() => handleSaveBest(s.supermarket)}
                    >
                      ❤️
                    </span>
                  )}
                </h4>
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
