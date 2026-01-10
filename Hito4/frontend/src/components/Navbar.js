import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import {
  AiOutlineHome,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { MdCompareArrows } from "react-icons/md";
import { FiUser, FiHeart, FiSettings, FiLogOut } from "react-icons/fi";
import { BsMoon, BsSun } from "react-icons/bs";

import mainLogo from "./mainlogo.png";

import { UserContext } from "../context/UserContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { LanguageContext } from "../context/LanguageContext";
import "./navbar.css";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const { favoritesCount } = useContext(FavoritesContext);
  const { lang, changeLanguage } = useContext(LanguageContext);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Theme toggle
  useEffect(() => {
    document.body.classList.toggle("dark-theme", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LEFT: Logo */}
      <Link to="/home" className="logo">
        <img src={mainLogo} alt="logo" className="logo-img" />
        CompraSmart
      </Link>

      {/* CENTER: Nav Links */}
      <div className="nav-links">
        <Link to="/home"><AiOutlineHome /> Inicio</Link>
        <Link to="/products"><AiOutlineShoppingCart /> Productos</Link>
        <Link to="/compare"><MdCompareArrows /> Comparar</Link>
        <Link to="/shopping-list"><AiOutlineShoppingCart /> Lista</Link>

        {token && (
          <Link to="/favorites" className="fav-link">
            <FiHeart />
            {favoritesCount > 0 && <span>{favoritesCount}</span>}
          </Link>
        )}
      </div>

      {/* RIGHT: Controls */}
      <div className="nav-right">
        {/* Language */}
        <select
          className="lang-select"
          value={lang}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="es">🇪🇸 ES</option>
          <option value="en">🇬🇧 EN</option>
        </select>

        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={() => setDark(!dark)}
          title="Toggle theme"
        >
          {dark ? <BsSun /> : <BsMoon />}
        </button>

        {/* Profile */}
        {token && user && (
          <div className="profile-nav" ref={ref}>
            <div
              className="profile-trigger"
              onClick={() => setOpen(!open)}
            >
              <img
                src={user.avatar || "/default-avatar.png"}
                alt="avatar"
                className="nav-avatar"
              />
              <span className="nav-username">
                {user.name}
              </span>
            </div>

            {open && (
              <div className="dropdown">
                <button onClick={() => navigate("/profile")}>
                  <FiUser /> Perfil
                </button>
                <button onClick={() => navigate("/settings")}>
                  <FiSettings /> Ajustes
                </button>
                <button onClick={logout}>
                  <FiLogOut /> Salir
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
