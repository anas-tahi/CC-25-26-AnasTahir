import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect, useRef } from 'react';
import { AiOutlineHome } from 'react-icons/ai';
import { FiBox, FiSettings, FiUser, FiHeart } from 'react-icons/fi';
import { MdCompareArrows, MdLanguage } from 'react-icons/md';
import { BsMoon, BsSun } from 'react-icons/bs';
import mainLogo from './mainlogo.png';

import { FavoritesContext } from '../context/FavoritesContext';
import { LanguageContext } from '../context/LanguageContext';
import { UserContext } from '../context/UserContext';

const Navbar = ({ theme, setTheme, setToken }) => {
  const { lang, toggleLanguage } = useContext(LanguageContext);
  const { favoritesCount } = useContext(FavoritesContext);
  const { user } = useContext(UserContext);
  const token = localStorage.getItem('token');

  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  // ⭐ NEW: Detect click outside
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

  const toggleThemeHandler = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleProfile = () => setShowProfile((prev) => !prev);

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
    <nav
      style={{
        ...styles.nav,
        backgroundColor: theme === 'light' ? '#fff' : '#121212',
        color: theme === 'light' ? '#222' : '#eee',
      }}
    >
      <div style={styles.left}>
        <Link to="/home" style={styles.logoLink}>
          <img src={mainLogo} alt="CompraSmart Logo" style={styles.logo} />
          <span style={styles.title}>CompraSmart</span>
        </Link>

        <Link to="/home" style={styles.link}>
          <AiOutlineHome style={styles.iconMargin} /> {t.home}
        </Link>

        <Link to="/products" style={styles.link}>
          <FiBox style={styles.iconMargin} /> {t.products}
        </Link>

        <Link to="/compare" style={styles.link}>
          <MdCompareArrows style={styles.iconMargin} /> {t.compare}
        </Link>

        {token && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Link to="/favorites" style={styles.link}>
              <FiHeart style={styles.iconMargin} /> {t.favorites}
            </Link>
            {favoritesCount > 0 && <span style={styles.badge}>{favoritesCount}</span>}
          </div>
        )}

        <Link to="/settings" style={styles.link}>
          <FiSettings style={styles.iconMargin} /> {t.settings}
        </Link>
      </div>

      <div style={styles.right}>
        {token && user && (
          <div
            style={styles.profileContainer}
            ref={dropdownRef}
            onMouseLeave={() => setShowProfile(false)} // ⭐ NEW: close on mouse leave
          >
            <button onClick={toggleProfile} style={styles.profileButton}>
              <FiUser style={styles.iconMargin} /> {user.name} ⏷
            </button>

            {showProfile && (
              <div style={{ ...styles.dropdownMenu, animation: 'fadeIn 0.2s ease' }}>
                <button onClick={() => navigate('/profile')} style={styles.dropdownItem}>
                  {t.viewProfile}
                </button>
                <button onClick={() => navigate('/favorites')} style={styles.dropdownItem}>
                  {t.wishlist}
                </button>
                <button onClick={() => navigate('/settings')} style={styles.dropdownItem}>
                  {t.settings}
                </button>
                <button
                  onClick={handleLogout}
                  style={{ ...styles.dropdownItem, color: '#dc3545' }}
                >
                  {t.logout}
                </button>
              </div>
            )}
          </div>
        )}

        <button onClick={toggleLanguage} style={{ ...styles.iconButton }}>
          <MdLanguage />
        </button>

        <button
          onClick={toggleThemeHandler}
          style={{ ...styles.iconButton, ...styles.themeIcon(theme) }}
        >
          {theme === 'light' ? <BsMoon /> : <BsSun />}
        </button>
      </div>

      {/* ⭐ Fade animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    borderRadius: '10px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    transition: 'all 0.3s ease',
  },
  left: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  right: { display: 'flex', gap: '1rem', alignItems: 'center' },
  logoLink: { display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.5rem' },
  logo: { height: '40px', borderRadius: '6px' },
  title: { fontSize: '1.3rem', fontWeight: 'bold', color: 'inherit' },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s ease',
  },
  iconMargin: { marginRight: '0.5rem' },
  iconButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.3rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    padding: '0.4rem',
  },
  themeIcon: (theme) => ({
    backgroundColor: theme === 'light' ? '#f0f0f0' : '#222',
    border: '1px solid #ccc',
    width: '2.5rem',
    height: '2.5rem',
    fontSize: '1.2rem',
    boxShadow: theme === 'dark' ? '0 0 8px #fff2' : '0 0 6px #0002',
  }),
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-10px',
    background: '#e74c3c',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    lineHeight: '1',
  },
  profileContainer: { position: 'relative' },
  profileButton: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    color: '#333',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderRadius: '8px',
    marginTop: '0.5rem',
    zIndex: 1000,
    width: '180px',
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownItem: {
    padding: '0.75rem 1rem',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
};

export default Navbar;
