import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthLanding from './pages/AuthLanding';
import Products from './pages/Products';
import Home from './pages/Home';
import Compare from './pages/Compare';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import Favorites from './pages/Favorites';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FavoritesProvider } from './context/FavoritesContext'; // ✅ Added
import Profile from './pages/Profile'; // ✅ Added



const App = () => {
  const [theme, setTheme] = useState('light');
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  useEffect(() => {
    toast.info('Welcome to CompraSmart!', {
      position: 'top-right',
      autoClose: 3000,
      theme: theme === 'dark' ? 'dark' : 'light',
    });
  }, []);

  return (
    <FavoritesProvider> {/* ✅ Wrap the app with context */}
      <style>{`
        body {
          margin: 0;
          transition: background-color 0.4s ease, color 0.4s ease;
          font-family: 'Segoe UI', sans-serif;
        }

        body.light-theme {
          background-color: #f8f9fa;
          color: #333;
        }

        body.dark-theme {
          background-color: #121212;
          color: #e0e0e0;
        }

        body.dark-theme a,
        body.dark-theme button,
        body.dark-theme input {
          background-color: #1e1e1e;
          color: #e0e0e0;
          border-color: #444;
        }
      `}</style>

      {token && <Navbar theme={theme} setTheme={setTheme} setToken={setToken} />}
      <Routes>
        <Route
          path="/"
          element={
            token ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={<AuthLanding setToken={setToken} />} />
        <Route path="/register" element={<AuthLanding setToken={setToken} />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme={theme === 'dark' ? 'dark' : 'light'} />
    </FavoritesProvider>
  );
};

export default App;
