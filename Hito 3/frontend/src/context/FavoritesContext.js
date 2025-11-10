import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoritesCount, setFavoritesCount] = useState(0);

  const fetchFavoritesCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const count = res.data.length;
      setFavoritesCount(count); // ✅ Clean and correct
    } catch (err) {
      console.error("Failed to fetch favorites count:", err);
    }
  };

  useEffect(() => {
    fetchFavoritesCount();
  }, []);

  return (
    <FavoritesContext.Provider value={{ favoritesCount, fetchFavoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
};
