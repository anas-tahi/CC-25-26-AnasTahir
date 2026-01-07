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

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [items, setItems] = useState([{ name: "leche", quantity: 1 }]);

  const [result, setResult] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [currentListId, setCurrentListId] = useState(null);
  const [listNameForEdit, setListNameForEdit] = useState("");

  /* ============================
     LOAD LIST FROM URL
  ============================ */
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

  /* ============================
     AUTOCOMPLETE (FIXED)
  ============================ */
  useEffect(() => {
    if (searchTerm.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `${PRODUCT_API_BASE}/products/names/${encodeURIComponent(
            searchTerm
          )}`,
          { signal: controller.signal }
        );

        if (!res.ok) return;

        const data = await res.json();

        const filtered = [
          ...new Set(
            data
              .map((d) => d.name)
              .filter((name) =>
                name.toLowerCase().startsWith(searchTerm.toLowerCase())
              )
          ),
        ];

        setSuggestions(filtered);
      } catch {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [searchTerm]);

  /* ============================
     ITEMS
  ============================ */
  const handleAddItem = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setItems((prev) => [...prev, { name: trimmed, quantity: 1 }]);
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "quantity"
                  ? Math.max(1, Number(value))
                  : value,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  /* ============================
     COMPARE (FIXED)
  ============================ */
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
      setError("Add at least one product.");
      return;
    }

    try {
      setLoadingCompare(true);
      const data = await compareList(normalized);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Compare failed.");
    } finally {
      setLoadingCompare(false);
    }
  };

  /* ============================
     SAVE LIST (FIXED)
  ============================ */
  const handleSaveList = async () => {
    if (!result) {
      setError("Compare before saving.");
      return;
    }

    const name = window.prompt(
      "List name:",
      listNameForEdit || "My shopping list"
    );
    if (!name) return;

    const normalized = items.map((i) => ({
      name: i.name.trim(),
      quantity: i.quantity || 1,
    }));

    try {
      setSaving(true);
      const saved = currentListId
        ? await updateShoppingList(currentListId, {
            name,
            items: normalized,
          })
        : await createShoppingList({ name, items: normalized });

      setCurrentListId(saved.id);
      setListNameForEdit(saved.name);
      alert("List saved!");
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ============================
     SAVE CHEAPEST ❤️
  ============================ */
  const handleSaveBest = async () => {
    if (!result?.best) return;

    const name = window.prompt(
      `Save cheapest list (${result.best.supermarket})`,
      "Cheapest list"
    );
    if (!name) return;

    const normalized = items.map((i) => ({
      name: i.name.trim(),
      quantity: i.quantity || 1,
    }));

    await createShoppingList({ name, items: normalized });
    alert("Saved!");
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="list-container">
      <h1 className="list-title">🛒 Shopping List</h1>

      {error && <div className="shopping-list-error">{error}</div>}

      <div className="list-input-box">
        <div style={{ position: "relative", flex: 1 }}>
          <input
            className="list-input"
            placeholder="Type a product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {suggestions.length > 0 && (
            <div className="list-suggestions">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="list-suggestion-item"
                  onClick={() => {
                    setSearchTerm(s);
                    setSuggestions([]);
                  }}
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

      <button className="list-compare-btn" onClick={handleCompare}>
        {loadingCompare ? "Comparing..." : "Compare prices"}
      </button>

      <button
        className="list-compare-btn"
        style={{ background: "#007bff", marginTop: "0.8rem" }}
        onClick={handleSaveList}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save list"}
      </button>

      {result && (
        <div className="list-results">
          <h2>Results</h2>

          <p>
            Best: <strong>{result.best.supermarket}</strong> —{" "}
            <strong>{result.best.total}€</strong>
          </p>

          <div className="list-grid">
            {result.supermarkets.map((s) => (
              <div key={s.supermarket} className="list-card">
                <h4>
                  {s.supermarket}
                  {s.supermarket === result.best.supermarket && (
                    <span className="heart" onClick={handleSaveBest}>
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
