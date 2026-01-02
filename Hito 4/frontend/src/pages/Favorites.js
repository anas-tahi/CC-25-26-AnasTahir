import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FiTag, FiTrash2 } from "react-icons/fi";
import { FaStore } from "react-icons/fa";
import Swal from "sweetalert2";
import { FavoritesContext } from "../context/FavoritesContext";
import { ThemeContext } from "../context/ThemeContext";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem("token");

  const { fetchFavoritesCount, decreaseFavoritesCount } = useContext(FavoritesContext);
  const { theme } = useContext(ThemeContext);

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

  const totalPrice = favorites.reduce((sum, item) => sum + item.price, 0);

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

      setFavorites((prev) => prev.filter((item) => item._id !== productId));

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
    <div className="favorites-container">
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <h2 className="favorites-heading">❤️ My Favorites</h2>

      {favorites.length === 0 ? (
        <p className="favorites-empty">You haven’t added anything yet.</p>
      ) : (
        <>
          <div className="favorites-grid">
            {favorites.map((item, i) => (
              <div key={i} className="favorites-card" style={{ animation: "fadeInUp 0.5s ease forwards" }}>
                <div className="favorites-card-header">
                  <h3 className="favorites-card-title">{item.name}</h3>

                  <button
                    className="favorites-delete-btn"
                    onClick={() => handleDelete(item._id)}
                    title="Remove from favorites"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <p className="favorites-card-item">
                  <FaStore className="favorites-icon" /> {item.supermarket}
                </p>

                <p className="favorites-card-item">
                  <FiTag className="favorites-icon-small" /> {item.price.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>

          <div className="favorites-total-bar">
            <p className="favorites-total-text">
              <strong>{favorites.length}</strong> items — Total:{" "}
              <strong>{totalPrice.toFixed(2)} €</strong>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;
