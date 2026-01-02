import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect, useRef } from 'react';
import { AiOutlineHome } from 'react-icons/ai';
import { FiBox, FiSettings, FiUser, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import { MdCompareArrows } from 'react-icons/md';
import { BsMoon, BsSun } from 'react-icons/bs';
import mainLogo from './mainlogo.png';

import { FavoritesContext } from '../context/FavoritesContext';
import { LanguageContext } from '../context/LanguageContext';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';

import './navbar.css';

const Navbar = ({ setToken }) => {
  const { lang, changeLanguage } = useContext(LanguageContext);
  const { favoritesCount } = useContext(FavoritesContext);
  const { user } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (setToken) setToken(null);
    navigate('/login');
  };

  const toggleProfile = () => setShowProfile((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  const labels = {
    en: {
      home: 'Home',
      products: 'Products',
      compare: 'Compare',
      settings: 'Settings',
      favorites: 'My Favorites',
      logout: 'Logout',
      wishlist: 'Wishlist',
      viewProfile: 'View Profile',
    },
    es: {
      home: 'Inicio',
      products: 'Productos',
      compare: 'Comparar',
      settings: 'Ajustes',
      favorites: 'Mis Favoritos',
      logout: 'Salir',
      wishlist: 'Lista de Deseos',
      viewProfile: 'Ver Perfil',
    },
  };

  const t = labels[lang];

  return (
    <nav className="navbar">
      {/* LEFT SIDE */}
      <div className="nav-left">
        <Link to="/home" className="logo-link">
          <img src={mainLogo} alt="CompraSmart Logo" className="logo" />
          <span className="title">CompraSmart</span>
        </Link>

        <div className="nav-links desktop-only">
          <Link to="/home" className="nav-link"><AiOutlineHome /> {t.home}</Link>
          <Link to="/products" className="nav-link"><FiBox /> {t.products}</Link>
          <Link to="/compare" className="nav-link"><MdCompareArrows /> {t.compare}</Link>
          {token && (
            <div className="favorites-wrapper">
              <Link to="/favorites" className="nav-link"><FiHeart /> {t.favorites}</Link>
              {favoritesCount > 0 && <span className="badge">{favoritesCount}</span>}
            </div>
          )}
          <Link to="/settings" className="nav-link"><FiSettings /> {t.settings}</Link>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        {token && user && (
          <div className="profile-container" ref={dropdownRef}>
            <button onClick={toggleProfile} className="profile-button">
              <FiUser /> {user.name} ⏷
            </button>
            {showProfile && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/profile')} className="dropdown-item">{t.viewProfile}</button>
                <button onClick={() => navigate('/favorites')} className="dropdown-item">{t.wishlist}</button>
                <button onClick={() => navigate('/settings')} className="dropdown-item">{t.settings}</button>
                <button onClick={handleLogout} className="dropdown-item logout">{t.logout}</button>
              </div>
            )}
          </div>
        )}

        <select value={lang} onChange={(e) => changeLanguage(e.target.value)} className="lang-select">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>

        <button onClick={toggleTheme} className="theme-btn">
          {theme === 'light' ? <BsMoon /> : <BsSun />}
        </button>

        <button className="mobile-menu-btn" onClick={toggleMobile}>
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/home" className="mobile-link" onClick={toggleMobile}>{t.home}</Link>
          <Link to="/products" className="mobile-link" onClick={toggleMobile}>{t.products}</Link>
          <Link to="/compare" className="mobile-link" onClick={toggleMobile}>{t.compare}</Link>
          <Link to="/favorites" className="mobile-link" onClick={toggleMobile}>{t.favorites}</Link>
          <Link to="/settings" className="mobile-link" onClick={toggleMobile}>{t.settings}</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
