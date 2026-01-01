import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FiTag, FiTrash2 } from "react-icons/fi";
import { FaStore } from "react-icons/fa";
import Swal from "sweetalert2";
import { FavoritesContext } from "../context/FavoritesContext";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem("token");

  const { fetchFavoritesCount, decreaseFavoritesCount } = useContext(FavoritesContext);

  // ⭐ Fetch favorites on load
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(
          "https://product-service-3lsh.onrender.com/wishlist",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFavorites(res.data);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      }
    };
    fetchFavorites();
  }, [token]);

  // ⭐ Total price calculation
  const totalPrice = favorites.reduce((sum, item) => sum + item.price, 0);

  // ⭐ Delete favorite item + update navbar count
  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from favorites?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `https://product-service-3lsh.onrender.com/wishlist/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔥 Animate removal
      setFavorites((prev) =>
        prev.filter((item) => item._id !== productId)
      );

      decreaseFavoritesCount();
      fetchFavoritesCount();

      Swal.fire({
        title: "Deleted!",
        text: "Item has been removed from your favorites.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err);
      Swal.fire({
        title: "Error",
        text: "Failed to remove item from favorites.",
        icon: "error",
      });
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes fadeSlideOut {
            0% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(-20px); }
          }

          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <h2 style={styles.heading}>❤️ My Favorites</h2>

      {favorites.length === 0 ? (
        <p style={styles.empty}>You haven’t added anything yet.</p>
      ) : (
        <>
          <div style={styles.grid}>
            {favorites.map((item, i) => (
              <div
                key={i}
                style={{
                  ...styles.card,
                  animation: "fadeInUp 0.5s ease forwards",
                }}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{item.name}</h3>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(item._id)}
                    title="Remove from favorites"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <p style={styles.cardItem}>
                  <FaStore style={styles.icon} /> {item.supermarket}
                </p>

                <p style={styles.cardItem}>
                  <FiTag style={styles.iconSmall} /> {item.price.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>

          {/* ⭐ Sticky Total Bar */}
          <div style={styles.totalBar}>
            <p style={styles.totalText}>
              <strong>{favorites.length}</strong> items — Total:{" "}
              <strong>{totalPrice.toFixed(2)} €</strong>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    position: "relative",
  },

  heading: {
    fontSize: "2.2rem",
    fontWeight: "700",
    marginBottom: "2rem",
    textAlign: "center",
    color: "#333",
  },

  empty: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#777",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "2rem",
    paddingBottom: "6rem",
  },

  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "1.5rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },

  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: "600",
    color: "#222",
  },

  cardItem: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
  },

  icon: {
    marginRight: "0.5rem",
    color: "#888",
  },

  iconSmall: {
    marginRight: "0.3rem",
    verticalAlign: "middle",
  },

  deleteBtn: {
    background: "none",
    border: "none",
    color: "#e74c3c",
    fontSize: "1.3rem",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },

  // ⭐ Sticky Total Bar
  totalBar: {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    background: "#fff",
    padding: "1rem",
    boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    zIndex: 100,
  },

  totalText: {
    fontSize: "1.2rem",
    color: "#333",
    fontWeight: "600",
  },
};

export default Favorites;
