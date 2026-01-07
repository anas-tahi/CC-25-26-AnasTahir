import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

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
import ShoppingList from './pages/ShoppingListCompare';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';


const AppContent = () => {
  const { theme } = useContext(ThemeContext);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Restore token on refresh
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  // Sync token across tabs
  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  // Welcome toast (runs once)
  useEffect(() => {
    toast.info('Welcome to CompraSmart!', {
      position: 'top-right',
      autoClose: 3000,
      theme: theme === 'dark' ? 'dark' : 'light',
    });
  }, []);

  return (
    <div className={`app-wrapper ${theme}`}>
      {token && <Navbar setToken={setToken} />}

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
          path="/shopping-list"
          element={
            <ProtectedRoute>
              <ShoppingList />
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

        {/* ⭐ REQUIRED FOR RENDER + REACT ROUTER V7 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};


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
