import { useState } from "react";
import axios from "axios";
import "./shoppingList.css";


const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    if (!input.trim()) return;
    setItems([...items, input.trim()]);
    setInput("");
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const compareList = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "https://product-service-3lsh.onrender.com/compare-list",
        { products: items }
      );
      setResult(res.data);
    } catch (err) {
      console.error("Compare list error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="list-container">
      <h1 className="list-title">🛒 Compare Your Shopping List</h1>

      {/* Input */}
      <div className="list-input-box">
        <input
          type="text"
          placeholder="Add a product..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="list-input"
        />
        <button onClick={addItem} className="list-add-btn">Add</button>
      </div>

      {/* Items */}
      <ul className="list-items">
        {items.map((item, i) => (
          <li key={i} className="list-item">
            {item}
            <button onClick={() => removeItem(i)} className="list-remove-btn">
              ✖
            </button>
          </li>
        ))}
      </ul>

      {/* Compare Button */}
      <button onClick={compareList} className="list-compare-btn">
        Compare List
      </button>

      {/* Loading */}
      {loading && <p className="list-loading">Comparing prices...</p>}

      {/* Results */}
      {result && (
        <div className="list-results">
          <h2>🏆 Best Supermarket: {result.best.supermarket}</h2>
          <p>Total: <strong>{result.best.total} €</strong></p>

          <h3>Full Breakdown:</h3>
          <div className="list-grid">
            {result.supermarkets.map((s, i) => (
              <div key={i} className="list-card">
                <h4>{s.supermarket}</h4>
                <p>Total: {s.total} €</p>
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
