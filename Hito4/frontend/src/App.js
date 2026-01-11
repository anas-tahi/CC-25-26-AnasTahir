// src/App.js
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";

// Pages
import AuthLanding from "./pages/AuthLanding";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Compare from "./pages/Compare";
import Settings from "./pages/Settings";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import UserGuide from "./pages/UserGuide";
import ShoppingListCompare from "./pages/ShoppingListCompare";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Contexts
import { UserProvider, UserContext } from "./context/UserContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { LanguageProvider, LanguageContext } from "./context/LanguageContext";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";

// Styles
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

/* ================= APP CONTENT ================= */

const AppContent = () => {
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { language, t } = useContext(LanguageContext);

  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  /* ===== GLOBAL WELCOME TOAST ===== */
  useEffect(() => {
    toast.info(t("welcomeToast"), {
      position: "top-right",
      autoClose: 3000,
      theme: theme === "dark" ? "dark" : "light",
    });
  }, [language, theme]);

  return (
    <div className="app-wrapper">
      {/* NAVBAR */}
      {user && !hideNavbar && <Navbar />}

      {/* ROUTES */}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />

        <Route path="/login" element={<AuthLanding />} />
        <Route path="/register" element={<AuthLanding />} />

        <Route
          path="/home"
          element={<ProtectedRoute><Home /></ProtectedRoute>}
        />
        <Route
          path="/products"
          element={<ProtectedRoute><Products /></ProtectedRoute>}
        />
        <Route
          path="/compare"
          element={<ProtectedRoute><Compare /></ProtectedRoute>}
        />
        <Route
          path="/shopping-list"
          element={<ProtectedRoute><ShoppingListCompare /></ProtectedRoute>}
        />
        <Route
          path="/favorites"
          element={<ProtectedRoute><Favorites /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><Settings /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route
          path="/user-guide"
          element={<ProtectedRoute><UserGuide /></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer />
    </div>
  );
};

/* ================= ROOT APP ================= */

const App = () => {
  return (
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
};

export default App;
