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
  const { language, toggleLanguage, t } = useContext(LanguageContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
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
      {/* LEFT */}
      <Link to="/home" className="logo">
        <img src={mainLogo} alt="logo" />
        <span>CompraSmart</span>
      </Link>

      {/* CENTER */}
      <div className="nav-links">
        <Link to="/home"><AiOutlineHome /> {t("Home", "Inicio")}</Link>
        <Link to="/products"><AiOutlineShoppingCart /> {t("Products", "Productos")}</Link>
        <Link to="/compare"><MdCompareArrows /> {t("Compare", "Comparar")}</Link>
        <Link to="/shopping-list"><AiOutlineShoppingCart /> {t("Shopping List", "Lista")}</Link>

        {token && (
          <Link to="/favorites" className="fav-link">
            <FiHeart />
            {favoritesCount > 0 && <span>{favoritesCount}</span>}
          </Link>
        )}
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        {/* LANGUAGE TOGGLE */}
        <button className="lang-btn" onClick={toggleLanguage}>
          {language === "en" ? "EN" : "ES"}
        </button>

        {/* THEME TOGGLE */}
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>

        {/* PROFILE DROPDOWN */}
        {token && user && (
          <div className="profile-nav" ref={ref}>
            <div
              className="profile-trigger"
              onClick={() => setOpen(!open)}
            >
              <img
                src={user.avatar || "/default-avatar.png"}
                alt="avatar"
              />
              <span>{user.name}</span>
            </div>

            {open && (
              <div className="dropdown">
                <button onClick={() => navigate("/profile")}>
                  <FiUser /> {t("Profile", "Perfil")}
                </button>
                <button onClick={() => navigate("/settings")}>
                  <FiSettings /> {t("Settings", "Ajustes")}
                </button>
                <button onClick={logout}>
                  <FiLogOut /> {t("Logout", "Salir")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
