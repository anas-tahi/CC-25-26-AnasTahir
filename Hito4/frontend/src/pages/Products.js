import { useState, useEffect, useContext } from "react";
import { productAPI } from "../services/api";
import { FiTag } from "react-icons/fi";
import { FaStore } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

import { FavoritesContext } from "../context/FavoritesContext";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";

import "./products.css";

const Products = () => {
  const [recommended, setRecommended] = useState([]);
  const { fetchFavoritesCount } = useContext(FavoritesContext);
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  // =========================
  // FETCH RECOMMENDED PRODUCTS
  // =========================
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await productAPI.get("/recommended");
        setRecommended(res.data || []);
      } catch (err) {
        console.error("❌ Failed to load recommended products:", err);
        Swal.fire(
          t("error", "Error"),
          t("failedLoadingProducts", "Failed to load products."),
          "error"
        );
      }
    };

    fetchRecommended();
  }, [t]);

  // =========================
  // HELPERS
  // =========================
  const getCheapestProductId = (items) => {
    if (!items || !items.length) return null;

    return items.reduce((min, item) =>
      item.price < min.price ? item : min
    ).id;
  };

  // =========================
  // ADD TO WISHLIST
  // =========================
  const handleAddToWishlist = async (productId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "https://product-service-3lsh.onrender.com/wishlist",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: t("addedToWishlist", "❤️ Added to wishlist!"),
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      fetchFavoritesCount();
    } catch (err) {
      console.error("❌ Wishlist error:", err.response?.data || err);

      Swal.fire({
        title: t("error", "❌ Error"),
        text: err.response?.data?.message || t("failedAddWishlist"),
        icon: "error",
      });
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className={`products-container ${theme}`}>
      <h2 className="products-heading">
        ⭐ {t("recommendedProducts", "Recommended Products")}
      </h2>

      <div className="products-grid">
        {recommended.map((product, index) => {
          const cheapestId = getCheapestProductId(product.supermarkets);

          return (
            <div key={index} className="product-card">
              <div className="product-badge">
                {t("recommendedBadge", "🔥 Recommended")}
              </div>

              <h3 className="product-title">{product.name}</h3>

              <ul className="product-list">
                {product.supermarkets.map((item, i) => (
                  <li
                    key={i}
                    className={`product-item ${
                      item.id === cheapestId ? "cheapest" : ""
                    }`}
                  >
                    <div className="product-left">
                      <FaStore className="product-icon" />
                      {item.supermarket}
                    </div>

                    <div className="product-right">
                      <span className="price-badge">
                        <FiTag className="price-icon" />
                        {typeof item.price === "number"
                          ? `${item.price.toFixed(2)}€`
                          : "-"}
                      </span>

                      {item.id === cheapestId && (
                        <button
                          onClick={() => handleAddToWishlist(item.id)}
                          className="wishlist-btn"
                          title={t("addToWishlist", "Add to wishlist")}
                        >
                          ❤️
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
