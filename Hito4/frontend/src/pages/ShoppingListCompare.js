import { useState, useEffect } from "react";
import { productAPI } from "../services/api";
import axios from "axios";
import Swal from "sweetalert2";
import "./ShoppingListCompare.css";

const ShoppingListCompare = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [list, setList] = useState([]);
  const [result, setResult] = useState(null);

  const token = localStorage.getItem("token");

  // autosuggest
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    productAPI
      .get(`/names/${encodeURIComponent(query)}`)
      .then(res => setSuggestions(res.data.map(p => p.name)))
      .catch(() => setSuggestions([]));
  }, [query]);

  const addProduct = name => {
    setList(prev => [...prev, { name, quantity: 1 }]);
    setQuery("");
    setSuggestions([]);
  };

  const compareList = async () => {
    try {
      const res = await productAPI.post("/compare-list", {
        products: list
      });
      setResult(res.data);
    } catch {
      Swal.fire("Error", "Comparison failed", "error");
    }
  };

  const saveList = async () => {
    try {
      await axios.post(
        "https://auth-service-3lsh.onrender.com/shopping-lists",
        { name: "My Shopping List", items: list },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Saved ❤️", "List saved to profile", "success");
    } catch {
      Swal.fire("Error", "Save failed", "error");
    }
  };

  return (
    <div className="list-container">
      <h2>🛒 Compare Shopping List</h2>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search product..."
      />

      {suggestions.map((s, i) => (
        <div key={i} className="suggestion" onClick={() => addProduct(s)}>
          {s} ➕
        </div>
      ))}

      <ul>
        {list.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ul>

      {list.length > 0 && (
        <button onClick={compareList}>Compare</button>
      )}

      {result && (
        <div className="results">
          {result.supermarkets.map((s, i) => (
            <div key={i} className={i === 0 ? "best" : ""}>
              {s.supermarket}: {s.total} €
            </div>
          ))}

          <button onClick={saveList}>❤️ Save List</button>
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
