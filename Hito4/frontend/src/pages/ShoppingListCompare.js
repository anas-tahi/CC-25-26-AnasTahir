import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { productAPI } from "../services/api";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import "../styles/ShoppingListCompare.css";

const recommendedLists = {
  students: ["Milk", "Bread", "Eggs"],
  family: ["Rice", "Chicken", "Apple Juice"]
};

const ShoppingListCompare = () => {
  const { user, fetchUser } = useContext(UserContext);
  const token = localStorage.getItem("token");

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [productList, setProductList] = useState([]);
  const [showPrices, setShowPrices] = useState(false);
  const [totalPrices, setTotalPrices] = useState({});
  const [cheapestSupermarket, setCheapestSupermarket] = useState(null);

  const fetchSuggestions = async (q) => {
    if (!q.trim()) return setSuggestions([]);
    try {
      const res = await productAPI.get(`/names/${encodeURIComponent(q)}`);
      setSuggestions(res.data.map((p) => p.name));
    } catch {
      setSuggestions([]);
    }
  };

  useEffect(() => { fetchSuggestions(query); }, [query]);

  const addProduct = async (name) => {
    if (productList.find((p) => p.product === name)) return;
    try {
      const res = await productAPI.get(`/compare/${encodeURIComponent(name)}`);
      setProductList((prev) => [...prev, res.data]);
      setQuery("");
      setSuggestions([]);
      setShowPrices(false); // hide prices again
    } catch {
      Swal.fire({ icon: "error", title: "Product not found" });
    }
  };

  const removeProduct = (name) => {
    setProductList((prev) => prev.filter((p) => p.product !== name));
  };

  const comparePrices = () => {
    const totals = {};
    productList.forEach((p) =>
      p.supermarkets.forEach((s) => {
        totals[s.supermarket] = (totals[s.supermarket] || 0) + s.price;
      })
    );
    setTotalPrices(totals);
    const cheapest = Object.keys(totals).reduce((a, b) =>
      totals[a] < totals[b] ? a : b
    , null);
    setCheapestSupermarket(cheapest);
    setShowPrices(true);
  };

  const addCheapestToProfile = async () => {
    if (!user) return Swal.fire({ icon: "error", title: "Login required" });
    const cheapestProducts = productList.map((p) => {
      const s = p.supermarkets.find((s) => s.supermarket === cheapestSupermarket);
      return { productId: s?.id, name: p.product };
    }).filter(p => p.productId); // filter out missing
    try {
      await axios.post(
        "https://product-service-3lsh.onrender.com/wishlist",
        { items: cheapestProducts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ icon: "success", title: "❤️ Cheapest products saved!" });
      fetchUser();
    } catch {
      Swal.fire({ icon: "error", title: "Failed to save list" });
    }
  };

  const loadRecommendedList = (type) => {
    recommendedLists[type].forEach(addProduct);
  };

  return (
    <div className="compare-container">
      <h2>🛒 Shopping List Compare</h2>

      {/* Recommended Lists */}
      <div className="recommended-lists">
        <span>Recommended: </span>
        <button onClick={() => loadRecommendedList("students")}>Students</button>
        <button onClick={() => loadRecommendedList("family")}>Family</button>
        <button onClick={() => setProductList([])}>Create Personal List</button>
      </div>

      {/* Search */}
      <div className="search-box">
        <input
          placeholder="Search product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={() => addProduct(query)}>Add</button>
        {suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => addProduct(s)}>{s}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Product List */}
      {productList.length > 0 && (
        <div className="result-box">
          <h3>Shopping List ({productList.length})</h3>
          <div className="result-grid">
            {productList.map((p, i) => (
              <div key={i} className="result-card">
                <div className="result-product">{p.product}</div>
                {showPrices && p.supermarkets.map((s, idx) => (
                  <div key={idx} className={s.supermarket === cheapestSupermarket ? "best" : ""}>
                    {s.supermarket}: {s.price.toFixed(2)} €
                    {s.supermarket === cheapestSupermarket && <span> ❤️</span>}
                  </div>
                ))}
                <button className="remove-btn" onClick={() => removeProduct(p.product)}>Remove</button>
              </div>
            ))}
          </div>

          {!showPrices ? (
            <button className="compare-btn" onClick={comparePrices}>Compare Prices</button>
          ) : (
            <button className="wishlist-btn" onClick={addCheapestToProfile}>❤️ Add Cheapest to Profile</button>
          )}

          {showPrices && (
            <div className="totals">
              <h4>Total Prices:</h4>
              {Object.keys(totalPrices).map((s, i) => (
                <div key={i} className={s === cheapestSupermarket ? "best" : ""}>
                  {s}: {totalPrices[s].toFixed(2)} €
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
