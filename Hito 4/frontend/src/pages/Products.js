import { useState, useEffect, useContext } from 'react';
import { productAPI } from '../services/api';
import { FiTag } from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';
import axios from 'axios'; // ✅ For wishlist requests
import Swal from 'sweetalert2'; // ✅ For styled popups
import { FavoritesContext } from '../context/FavoritesContext'; // ✅ Context

const Products = () => {
  const [recommended, setRecommended] = useState([]);
  const { fetchFavoritesCount } = useContext(FavoritesContext); // ✅ Context integration

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await productAPI.get('/');
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

  // ✅ Wishlist handler with SweetAlert2 + badge update
  const handleAddToWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/wishlist",
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire({
        title: '✅ Added to wishlist!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchFavoritesCount(); // ✅ Update badge after adding
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
      <h2 style={styles.heading}>⭐ Recommended Products</h2>
      <div style={styles.grid}>
        {recommended.map(([name, items], index) => {
          const cheapestId = getCheapestProductId(items);
          return (
            <div key={index} style={styles.card}>
              <h3 style={styles.cardTitle}>{name}</h3>
              <ul style={styles.cardList}>
                {items.map((item, i) => (
                  <li key={i} style={styles.cardItem}>
                    <FaStore style={styles.icon} /> {item.supermarket} — 
                    <span style={styles.priceBadge}>
                      <FiTag style={styles.iconSmall} /> {item.price.toFixed(2)}€
                    </span>
                    {item._id === cheapestId && (
                      <button
                        onClick={() => handleAddToWishlist(item._id)}
                        style={{
                          marginLeft: '1rem',
                          padding: '0.3rem 0.6rem',
                          backgroundColor: '#ff4081',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        ❤️
                      </button>
                    )}
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
    transition: 'background 0.3s ease',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#222',
  },
  cardList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  cardItem: {
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#555',
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
    backgroundColor: '#ffefc1',
    padding: '0.2rem 0.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    color: '#d67e00',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
};

export default Products;
