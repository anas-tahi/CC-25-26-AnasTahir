// src/pages/ShoppingListCompare.js
import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { productAPI } from "../services/api";
import { FavoritesContext } from "../context/FavoritesContext";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ShoppingListCompare.css";

const recommendedLists = {
  Students: [
    { name: "Back to Campus", products: ["Pasta", "Milk", "Eggs"] },
    { name: "Quick Meals", products: ["Bread", "Cheese", "Tomato"] },
    { name: "Budget Essentials", products: ["Rice", "Chicken", "Lettuce"] },
  ],
  Family: [
    { name: "Weekly Grocery", products: ["Milk", "Eggs", "Bread", "Rice"] },
    { name: "Healthy Family", products: ["Salmon", "Spinach", "Oats"] },
    { name: "Party Snacks", products: ["Chips", "Soda", "Chocolate"] },
  ],
};

const ShoppingListCompare = () => {
  const { user, fetchUser } = useContext(UserContext);
  const token = localStorage.getItem("token");

  const [selectedList, setSelectedList] = useState(null);
  const [productList, setProductList] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showCompare, setShowCompare] = useState(false);
  const [totalPrices, setTotalPrices] = useState({});
  const [cheapestSupermarket, setCheapestSupermarket] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  // =======================
  // USER LOCATION (optional)
  // =======================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, []);

  // =======================
  // FETCH SUGGESTIONS
  // =======================
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await productAPI.get(`/names/${encodeURIComponent(query)}`);
        setSuggestions((res.data || []).map((p) => p.name));
        setHighlightIndex(-1);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [query]);

  // =======================
  // ADD PRODUCT
  // =======================
  const handleAddProduct = async (name) => {
    if (!name) return;
    if (productList.find((p) => p.product === name)) {
      Swal.fire({ icon: "info", title: "Already added", text: name });
      return;
    }
    try {
      const res = await productAPI.get(`/compare/${encodeURIComponent(name)}`);
      setProductList((prev) => [...prev, res.data]);
      setQuery("");
      setSuggestions([]);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Product not found." });
    }
  };

  // =======================
  // REMOVE PRODUCT
  // =======================
  const handleRemoveProduct = (name) => {
    setProductList((prev) => prev.filter((p) => p.product !== name));
  };

  // =======================
  // COMPARE PRICES
  // =======================
  const handleCompare = () => {
    const totals = {};
    productList.forEach((p) => {
      p.supermarkets.forEach((s) => {
        if (!totals[s.supermarket]) totals[s.supermarket] = 0;
        totals[s.supermarket] += s.price;
      });
    });
    setTotalPrices(totals);
    const cheapest = Object.keys(totals).reduce((a, b) => (totals[a] < totals[b] ? a : b));
    setCheapestSupermarket(cheapest);
    setShowCompare(true);
  };

  // =======================
  // ADD CHEAPEST TO PROFILE
  // =======================
  const handleAddCheapestToProfile = async () => {
    if (!showCompare || productList.length === 0) {
      Swal.fire({ icon: "info", title: "Compare first!" });
      return;
    }
    try {
      const listData = {
        name: "My List",
        items: productList.map((p) => {
          const cheapest = p.supermarkets.find((s) => s.supermarket === cheapestSupermarket);
          return { product: p.product, id: cheapest.id, supermarket: cheapest.supermarket, price: cheapest.price };
        }),
      };
      await axios.post("https://product-service-3lsh.onrender.com/shopping-lists", listData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({ icon: "success", title: "List saved to your profile!" });
      fetchUser();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed to save list." });
    }
  };

  // =======================
  // KEYBOARD NAV
  // =======================
  const handleKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    else if (e.key === "ArrowUp") setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    else if (e.key === "Enter") handleAddProduct(highlightIndex >= 0 ? suggestions[highlightIndex] : query);
  };

  // =======================
  // LOAD RECOMMENDED LIST
  // =======================
  const selectRecommendedList = (list) => {
    setSelectedList(list.name);
    const products = list.products;
    products.forEach((p) => handleAddProduct(p));
  };

  const startPersonalList = () => setSelectedList("Personal List");

  // =======================
  // RENDER
  // =======================
  if (!selectedList) {
    return (
      <div className="compare-container">
        <h2 className="compare-heading">🎯 Recommended Lists</h2>
        {Object.keys(recommendedLists).map((category) => (
          <div key={category} className="recommended-category">
            <h3>{category}</h3>
            <div className="recommended-list-grid">
              {recommendedLists[category].map((list, idx) => (
                <button key={idx} onClick={() => selectRecommendedList(list)} className="recommended-btn">
                  {list.name}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: "2rem" }}>
          <button className="recommended-btn personal" onClick={startPersonalList}>
            ➕ Create Personal List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-container">
      <h2 className="compare-heading">🛒 {selectedList}</h2>

      {/* Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => handleAddProduct(query)}>Add Product</button>

        {suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((s, i) => (
              <li key={i} className={highlightIndex === i ? "active" : ""} onClick={() => handleAddProduct(s)}>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Product List */}
      {productList.length > 0 && (
        <div className="result-box">
          <div className="result-grid">
            {productList.map((p, idx) => (
              <div key={idx} className="result-card">
                <div className="result-product">{p.product}</div>
                {/* Prices only after compare */}
                {showCompare && (
                  <div className="result-supermarket-prices">
                    {p.supermarkets.map((s, i) => {
                      const isCheapest = s.supermarket === cheapestSupermarket;
                      return (
                        <div key={i} className={`result-price ${isCheapest ? "best" : ""}`}>
                          {s.supermarket}: {s.price.toFixed(2)} € {isCheapest && "❤️"}
                        </div>
                      );
                    })}
                  </div>
                )}
                <button className="exit-btn" onClick={() => handleRemoveProduct(p.product)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            {!showCompare && <button onClick={handleCompare} className="compare-btn">Compare Prices</button>}
            {showCompare && <button onClick={handleAddCheapestToProfile} className="wishlist-btn">❤️ Add Cheapest to Profile</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
