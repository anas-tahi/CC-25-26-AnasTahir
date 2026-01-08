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
import { LanguageProvider } from "./context/LanguageContext";
import { UserProvider, UserContext } from "./context/UserContext";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";

import "react-toastify/dist/ReactToastify.css";

const AppContent = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  useEffect(() => {
    toast.info("Welcome to CompraSmart!", {
      position: "top-right",
      autoClose: 3000,
      theme: theme === "dark" ? "dark" : "light",
    });
  }, [theme]);

  return (
    <div className={`app-wrapper ${theme}`}>
      {user && !hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} />
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
