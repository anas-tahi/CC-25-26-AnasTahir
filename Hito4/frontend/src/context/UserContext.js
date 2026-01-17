// src/context/UserContext.js
import { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ new
  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    setLoading(true); // ✅ start loading
    try {
      if (!token) {
        setUser(null);
      } else {
        const res = await authAPI.get("/me");
        setUser(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoading(false); // ✅ done loading
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
