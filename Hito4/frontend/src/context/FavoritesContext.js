import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoritesCount, setFavoritesCount] = useState(0);

  const fetchFavoritesCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        "https://product-service-3lsh.onrender.com/wishlist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFavoritesCount(res.data.length);
    } catch (err) {
      console.error("Failed to fetch favorites count:", err);
    }
  };

  // 🔥 NEW: decrease count instantly without waiting for backend
  const decreaseFavoritesCount = () => {
    setFavoritesCount(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    fetchFavoritesCount();
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favoritesCount,
        fetchFavoritesCount,
        decreaseFavoritesCount
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
