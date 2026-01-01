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
import Profile from './pages/Profile';
import UserGuide from './pages/UserGuide';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';

const App = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ⭐ Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ⭐ Apply theme variables globally
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.style.setProperty('--bg', '#121212');
      root.style.setProperty('--text', '#e0e0e0');
      root.style.setProperty('--card', '#1e1e1e');
      root.style.setProperty('--border', '#333');
      root.style.setProperty('--input-bg', '#1e1e1e');
    } else {
      root.style.setProperty('--bg', '#f8f9fa');
      root.style.setProperty('--text', '#333');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--border', '#ddd');
      root.style.setProperty('--input-bg', '#ffffff');
    }
  }, [theme]);

  // Sync token across tabs
  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  // Welcome toast
  useEffect(() => {
    toast.info('Welcome to CompraSmart!', {
      position: 'top-right',
      autoClose: 3000,
      theme: theme === 'dark' ? 'dark' : 'light',
    });
  }, []);

  return (
    <UserProvider>
      <FavoritesProvider>
        <LanguageProvider>
          {/* ⭐ Global Theme Styles */}
          <style>{`
            * {
              transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }

            body {
              margin: 0;
              background: var(--bg);
              color: var(--text);
              font-family: 'Segoe UI', sans-serif;
            }

            .app-wrapper {
              min-height: 100vh;
              background: var(--bg);
              color: var(--text);
            }

            input, button, textarea {
              background: var(--input-bg);
              color: var(--text);
              border-color: var(--border);
            }

            .card {
              background: var(--card);
              border-color: var(--border);
            }
          `}</style>

          <div className={`app-wrapper ${theme}`}>
            {token && <Navbar theme={theme} setTheme={setTheme} setToken={setToken} />}

            <Routes>
              <Route
                path="/"
                element={token ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
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
              <Route
                path="/user-guide"
                element={
                  <ProtectedRoute>
                    <UserGuide />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </div>
        </LanguageProvider>
      </FavoritesProvider>
    </UserProvider>
  );
};

export default App;
