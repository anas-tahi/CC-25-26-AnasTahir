// frontend/src/pages/ShoppingList.js
import React, { useEffect, useState } from "react";
import {
  getShoppingLists,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  compareList,
} from "../api/shoppingLists";

const ShoppingList = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [itemsInput, setItemsInput] = useState("");
  const [compareResults, setCompareResults] = useState(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);

  useEffect(() => {
    fetchLists();
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
  };

  const handleSelect = (list) => {
    setSelectedList(list);
    setItemsInput(list.items?.map((i) => i.name).join(", ") || "");
    setCompareResults(null);
  };

  const handleUpdate = async () => {
    if (!selectedList) return;
    const items = itemsInput
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
      .map((name) => ({ name, quantity: 1 }));

    const updated = await updateShoppingList(selectedList._id, {
      ...selectedList,
      items,
    });
    setLists((prev) =>
      prev.map((l) => (l._id === selectedList._id ? updated : l))
    );
    setSelectedList(updated);
  };

  const handleCompare = async () => {
    if (!selectedList) return;
    const items = selectedList.items || [];
    const result = await compareList(items);
    setCompareResults(result);
  };

  const handleAutocomplete = (value) => {
    // Example: suggest based on local array (replace with API if needed)
    const suggestions = ["Milk", "Eggs", "Bread", "Butter", "Cheese"].filter(
      (i) => i.toLowerCase().includes(value.toLowerCase())
    );
    setAutocompleteSuggestions(suggestions);
  };

  return (
    <div className="shopping-list-page">
      <h1>Shopping Lists</h1>

      <div className="new-list">
        <input
          type="text"
          placeholder="New list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <button onClick={handleCreate}>Create</button>
      </div>

      <div className="lists-container">
        {lists.map((list) => (
          <div
            key={list._id}
            className={`list-item ${
              selectedList?._id === list._id ? "selected" : ""
            }`}
            onClick={() => handleSelect(list)}
          >
            {list.name}
            <button onClick={() => handleDelete(list._id)}>Delete</button>
          </div>
        ))}
      </div>

      {selectedList && (
        <div className="list-editor">
          <h2>{selectedList.name}</h2>
          <textarea
            value={itemsInput}
            onChange={(e) => {
              setItemsInput(e.target.value);
              handleAutocomplete(e.target.value);
            }}
            placeholder="Enter items separated by commas"
          />
          {autocompleteSuggestions.length > 0 && (
            <ul className="autocomplete-suggestions">
              {autocompleteSuggestions.map((s) => (
                <li key={s} onClick={() => setItemsInput(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleUpdate}>Save</button>
          <button onClick={handleCompare}>Compare Prices</button>
        </div>
      )}

      {compareResults && (
        <div className="compare-results">
          <h3>Compare Results:</h3>
          <pre>{JSON.stringify(compareResults, null, 2)}</pre>
        </div>
      )}

      {/* Embed CSS directly */}
      <style>{`
        .shopping-list-page {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: auto;
        }
        .new-list {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .new-list input {
          flex: 1;
          padding: 8px;
          font-size: 16px;
        }
        .new-list button {
          padding: 8px 16px;
          font-size: 16px;
        }
        .lists-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .list-item {
          padding: 10px;
          border: 1px solid #ccc;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .list-item.selected {
          background-color: #f0f0f0;
          border-color: #333;
        }
        .list-editor {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .list-editor textarea {
          width: 100%;
          height: 100px;
          padding: 8px;
          font-size: 16px;
        }
        .list-editor button {
          width: fit-content;
          padding: 8px 16px;
          font-size: 16px;
          margin-right: 10px;
        }
        .autocomplete-suggestions {
          list-style: none;
          padding: 0;
          margin: 0;
          border: 1px solid #ccc;
          max-width: 300px;
        }
        .autocomplete-suggestions li {
          padding: 5px 10px;
          cursor: pointer;
        }
        .autocomplete-suggestions li:hover {
          background-color: #eee;
        }
        .compare-results {
          margin-top: 20px;
          background-color: #f9f9f9;
          padding: 10px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
};

export default ShoppingList;
