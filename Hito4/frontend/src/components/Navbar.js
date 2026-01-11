import { Link, useNavigate } from "react-router-dom";
import { useContext, useRef, useEffect, useState } from "react";
import {
  AiOutlineHome,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { MdCompareArrows } from "react-icons/md";
import {
  FiUser,
  FiHeart,
  FiLogOut,
  FiSettings,
  FiMoon,
  FiSun,
  FiMenu,
  FiX,
} from "react-icons/fi";

import mainLogo from "./mainlogo.png";
import { UserContext } from "../context/UserContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../context/ThemeContext";
import "./navbar.css";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const { favoritesCount } = useContext(FavoritesContext);
  const { lang, toggleLanguage, t } = useContext(LanguageContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [openProfile, setOpenProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className={`navbar ${theme}`}>
      {/* LOGO */}
      <Link to="/home" className="logo">
        <img src={mainLogo} alt="logo" />
        <span>CompraSmart</span>
      </Link>

      {/* DESKTOP LINKS */}
      <div className="nav-links">
        <Link to="/home"><AiOutlineHome /> {t("home")}</Link>
        <Link to="/products"><AiOutlineShoppingCart /> Products</Link>
        <Link to="/compare"><MdCompareArrows /> Compare</Link>
        <Link to="/shopping-list"><AiOutlineShoppingCart /> List</Link>

        {token && (
          <Link to="/favorites" className="fav-link">
            <FiHeart />
            {favoritesCount > 0 && <span>{favoritesCount}</span>}
          </Link>
        )}
      </div>

      {/* RIGHT CONTROLS */}
      <div className="nav-right">
        {/* Language */}
        <button className="lang-btn" onClick={toggleLanguage}>
          {lang === "en" ? "ES" : "EN"}
        </button>

        {/* Theme */}
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>

        {/* Profile */}
        {token && user && (
          <div className="profile-nav" ref={profileRef}>
            <div className="profile-trigger" onClick={() => setOpenProfile(!openProfile)}>
              <img src={user.avatar || "/default-avatar.png"} alt="avatar" />
              <span>{user.name}</span>
            </div>

            {openProfile && (
              <div className="dropdown">
                <button onClick={() => navigate("/profile")}><FiUser /> {t("profile")}</button>
                <button onClick={() => navigate("/settings")}><FiSettings /> {t("settings")}</button>
                <button onClick={logout}><FiLogOut /> {t("logout")}</button>
              </div>
            )}
          </div>
        )}

        {/* MOBILE HAMBURGER */}
        <button className="hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className={`mobile-menu ${theme}`}>
          <Link to="/home" onClick={() => setMobileOpen(false)}><AiOutlineHome /> {t("home")}</Link>
          <Link to="/products" onClick={() => setMobileOpen(false)}><AiOutlineShoppingCart /> Products</Link>
          <Link to="/compare" onClick={() => setMobileOpen(false)}><MdCompareArrows /> Compare</Link>
          <Link to="/shopping-list" onClick={() => setMobileOpen(false)}><AiOutlineShoppingCart /> List</Link>
          {token && <Link to="/favorites" onClick={() => setMobileOpen(false)}><FiHeart /> Favorites {favoritesCount > 0 && `(${favoritesCount})`}</Link>}
          {token && user && <>
            <button onClick={() => { setMobileOpen(false); navigate("/profile"); }}><FiUser /> {t("profile")}</button>
            <button onClick={() => { setMobileOpen(false); navigate("/settings"); }}><FiSettings /> {t("settings")}</button>
            <button onClick={() => { setMobileOpen(false); logout(); }}><FiLogOut /> {t("logout")}</button>
          </>}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
