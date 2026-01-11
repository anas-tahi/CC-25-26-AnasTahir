// src/App.js
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";

import AuthLanding from "./pages/AuthLanding";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Compare from "./pages/Compare";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import UserGuide from "./pages/UserGuide";
import ProtectedRoute from "./components/ProtectedRoute";
import ShoppingListCompare from "./pages/ShoppingListCompare";

import { FavoritesProvider } from "./context/FavoritesContext";
import { LanguageProvider, LanguageContext } from "./context/LanguageContext";
import { UserProvider, UserContext } from "./context/UserContext";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";

import "react-toastify/dist/ReactToastify.css";

const AppContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Welcome toast
  useEffect(() => {
    toast.info(
      t("Welcome to CompraSmart!", "¡Bienvenido a CompraSmart!"),
      {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      }
    );
  }, [theme, language]);

  return (
    <div className={`app-wrapper ${theme}`}>
      {/* Navbar */}
      {user && !hideNavbar && <Navbar />}

      {/* Optional Topbar for toggles */}
      {user && !hideNavbar && (
        <div className="topbar" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "10px 20px" }}>
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#111",
            }}
          >
            {language === "en" ? "EN" : "ES"}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#111",
            }}
          >
            {theme === "light" ? "🌞" : "🌙"}
          </button>
        </div>
      )}

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<AuthLanding />} />
        <Route path="/register" element={<AuthLanding />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
        <Route path="/shopping-list" element={<ProtectedRoute><ShoppingListCompare /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user-guide" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer />
    </div>
  );
};

const App = () => (
  <UserProvider>
    <FavoritesProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </LanguageProvider>
    </FavoritesProvider>
  </UserProvider>
);

export default App;
