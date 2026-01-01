import { useState, useEffect, useContext } from 'react';
import { productAPI } from '../services/api';
import { FiTag } from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FavoritesContext } from '../context/FavoritesContext';

const Products = () => {
  const [recommended, setRecommended] = useState([]);
  const { fetchFavoritesCount } = useContext(FavoritesContext);

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

  const getCheapestProductId = (items) => {
    if (!items.length) return null;
    return items.reduce((min, item) => (item.price < min.price ? item : min))._id;
  };

  return (
    <div style={styles.container}>
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

      <h2 style={styles.heading}>⭐ Recommended Products</h2>

      <div style={styles.grid}>
        {recommended.map(([name, items], index) => {
          const cheapestId = getCheapestProductId(items);

          return (
            <div key={index} style={{ ...styles.card, animation: 'fadeInUp 0.6s ease forwards' }}>
              
              {/* Animated Badge */}
              <div style={styles.badge}>🔥 Recommended</div>

              <h3 style={styles.cardTitle}>{name}</h3>

              <ul style={styles.cardList}>
                {items.map((item, i) => (
                  <li key={i} style={styles.cardItem}>
                    <div style={styles.left}>
                      <FaStore style={styles.icon} /> {item.supermarket}
                    </div>

                    <div style={styles.right}>
                      <span style={styles.priceBadge}>
                        <FiTag style={styles.iconSmall} /> {item.price.toFixed(2)}€
                      </span>

                      {item._id === cheapestId && (
                        <button
                          onClick={() => handleAddToWishlist(item._id)}
                          style={styles.heartButton}
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

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },

  heading: {
    fontSize: '2.4rem',
    fontWeight: '700',
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#222',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },

  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '18px',
    padding: '1.8rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
    transition: 'transform 0.35s ease, box-shadow 0.35s ease, border 0.35s ease',
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: '-12px',
    right: '12px',
    background: 'linear-gradient(90deg, #ff7eb3, #ff758c)',
    padding: '0.3rem 0.8rem',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.85rem',
    animation: 'pulseBadge 2s infinite ease-in-out',
  },

  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#222',
  },

  cardList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },

  cardItem: {
    padding: '0.7rem 0',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#444',
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },

  icon: {
    marginRight: '0.5rem',
    color: '#888',
  },

  iconSmall: {
    marginRight: '0.3rem',
    verticalAlign: 'middle',
  },

  priceBadge: {
    background: 'linear-gradient(90deg, #ffe29f, #ffa99f)',
    padding: '0.3rem 0.6rem',
    borderRadius: '10px',
    fontWeight: '700',
    color: '#7a3e00',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.95rem',
    boxShadow: '0 3px 8px rgba(255,150,0,0.25)',
  },

  heartButton: {
    backgroundColor: '#ff4081',
    color: '#fff',
    border: 'none',
    padding: '0.35rem 0.6rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'transform 0.2s ease',
  },
};

export default Products;
