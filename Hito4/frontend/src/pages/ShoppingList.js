import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  compareList,
  getShoppingList,
  createShoppingList,
  updateShoppingList,
} from "../api/shoppingLists"; // adjust path if needed
import "./shoppingList.css"; // keep or adapt

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ShoppingList = () => {
  const query = useQuery();
  const [items, setItems] = useState([{ name: "", quantity: 1 }]);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentListId, setCurrentListId] = useState(null); // for edit
  const [listNameForEdit, setListNameForEdit] = useState("");

  // Load list by ID from URL ?listId=...
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
            : [{ name: "", quantity: 1 }]
        );
        setCurrentListId(list.id);
        setListNameForEdit(list.name || "");
      } catch (err) {
        console.error("Error loading list from URL:", err);
      }
    })();
  }, [query]);

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

  const handleAddRow = () => {
    setItems([...items, { name: "", quantity: 1 }]);
  };

  const handleRemoveRow = (index) => {
    if (items.length === 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

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
      setError("Please add at least one product");
      return;
    }

    try {
      setLoadingCompare(true);
      const data = await compareList(normalized);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Error comparing list");
    } finally {
      setLoadingCompare(false);
    }
  };

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

    if (normalized.length === 0) {
      setError("Cannot save an empty list.");
      return;
    }

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
        setCurrentListId(saved.id);
      }
      setListNameForEdit(saved.name);
    } catch (err) {
      console.error(err);
      setError("Error saving list. Are you logged in?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shopping-list-page">
      <h1>Shopping List</h1>

      {currentListId && (
        <div className="shopping-list-current-name">
          Editing list: <strong>{listNameForEdit}</strong>
        </div>
      )}

      {error && <div className="shopping-list-error">{error}</div>}

      <div className="shopping-list-inputs">
        {items.map((item, index) => (
          <div key={index} className="shopping-list-row">
            <input
              type="text"
              placeholder="Product name"
              value={item.name}
              onChange={(e) =>
                handleItemChange(index, "name", e.target.value)
              }
            />
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
              className="shopping-list-quantity"
            />
            <button
              type="button"
              onClick={() => handleRemoveRow(index)}
              className="shopping-list-remove"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddRow}
          className="shopping-list-add-row"
        >
          + Add item
        </button>
      </div>

      <div className="shopping-list-actions">
        <button
          type="button"
          onClick={handleCompare}
          disabled={loadingCompare}
          className="shopping-list-compare-btn"
        >
          {loadingCompare ? "Comparing..." : "Compare prices"}
        </button>

        <button
          type="button"
          onClick={handleSaveList}
          disabled={saving || !result}
          className="shopping-list-save-btn"
        >
          {saving ? "Saving..." : "Save this list"}
        </button>
      </div>

      {result && (
        <div className="shopping-list-results">
          <h2>Comparison</h2>

          <div className="shopping-list-summary">
            {result.best ? (
              <p>
                Best supermarket: <strong>{result.best.supermarket}</strong>{" "}
                — total: <strong>{result.best.total}€</strong> — missing items:{" "}
                <strong>{result.best.missing}</strong>
              </p>
            ) : (
              <p>No supermarkets found for these products.</p>
            )}
          </div>

          <div className="shopping-list-supermarkets">
            {result.supermarkets &&
              result.supermarkets.map((s) => (
                <div
                  key={s.supermarket}
                  className="shopping-list-supermarket-card"
                >
                  <h3>{s.supermarket}</h3>
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
