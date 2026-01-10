import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import {
  AiOutlineHome,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { MdCompareArrows } from "react-icons/md";
import { FiUser, FiHeart, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import mainLogo from "./mainlogo.png";

import { UserContext } from "../context/UserContext";
import { FavoritesContext } from "../context/FavoritesContext";
import "./navbar.css";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const { favoritesCount } = useContext(FavoritesContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("EN");
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

  const toggleTheme = () => {
    setDark(!dark);
    document.body.classList.toggle("dark");
  };

  return (
    <nav className="navbar">
      {/* ===== LEFT ===== */}
      <Link to="/home" className="logo">
        <img src={mainLogo} alt="logo" />
        <span>CompraSmart</span>
      </Link>

      {/* ===== CENTER ===== */}
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

      {/* ===== RIGHT ===== */}
      <div className="nav-right">
        {/* LANGUAGE */}
        <select
          className="lang-select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="EN">EN</option>
          <option value="ES">ES</option>
        </select>

        {/* THEME */}
        <button className="theme-btn" onClick={toggleTheme}>
          {dark ? <FiSun /> : <FiMoon />}
        </button>

        {/* PROFILE */}
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
                  <FiUser /> Perfil
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
