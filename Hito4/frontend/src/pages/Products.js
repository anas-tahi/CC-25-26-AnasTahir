import { useState, useEffect, useContext } from 'react';
import { productAPI } from '../services/api';
import { FiTag } from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FavoritesContext } from '../context/FavoritesContext';
import { ThemeContext } from '../context/ThemeContext';
import "./products.css";


const Products = () => {
  const [recommended, setRecommended] = useState([]);
  const { fetchFavoritesCount } = useContext(FavoritesContext);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await productAPI.get('/recommendations');
        const grouped = groupByName(res.data);
        const limited = Object.entries(grouped).slice(0, 6);
        setRecommended(limited);
      } catch (err) {
        console.error('Failed to load recommended products:', err);
      }
    };
    fetchRecommended();
  }, []);

  const groupByName = (products) => {
    const map = {};
    products.forEach((p) => {
      const name = p.name;
      if (!map[name]) map[name] = [];
      map[name].push(p);
    });
    return map;
  };

  // ⭐ FIXED: use item.id (NOT item._id)
  const getCheapestProductId = (items) => {
    if (!items.length) return null;
    return items.reduce((min, item) => (item.price < min.price ? item : min)).id;
  };

  // ⭐ FIXED: send productId: item.id
  const handleAddToWishlist = async (productId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "https://product-service-3lsh.onrender.com/wishlist",
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        title: '❤️ Added to wishlist!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      fetchFavoritesCount();
    } catch (err) {
      console.error("❌ Wishlist error:", err.response?.data || err);

      if (err.response && err.response.data?.message) {
        Swal.fire({
          title: '⚠️ Already added',
          text: err.response.data.message,
          icon: 'info',
        });
      } else {
        Swal.fire({
          title: '❌ Error',
          text: 'Failed to add to wishlist.',
          icon: 'error',
        });
      }
    }
  };

  return (
    <div className="products-container">
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulseBadge {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      <h2 className="products-heading">⭐ Recommended Products</h2>

      <div className="products-grid">
        {recommended.map(([name, items], index) => {
          const cheapestId = getCheapestProductId(items);

          return (
            <div key={index} className="product-card" style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
              
              <div className="product-badge">🔥 Recommended</div>

              <h3 className="product-title">{name}</h3>

              <ul className="product-list">
                {items.map((item, i) => (
                  <li key={i} className="product-item">
                    <div className="product-left">
                      <FaStore className="product-icon" /> {item.supermarket}
                    </div>

                    <div className="product-right">
                      <span className="price-badge">
                        <FiTag className="price-icon" /> {item.price.toFixed(2)}€
                      </span>

                      {/* ⭐ FIXED: use item.id */}
                      {item.id === cheapestId && (
                        <button
                          onClick={() => handleAddToWishlist(item.id)}
                          className="wishlist-btn"
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
