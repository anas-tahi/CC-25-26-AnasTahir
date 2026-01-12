// src/pages/Home.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { productAPI, commentAPI, authAPI } from "../services/api";

import mercadonaLogo from "./logos/mercadona.jpeg";
import carrefourLogo from "./logos/carrefour.png";
import lidlLogo from "./logos/lidl.png";
import diaLogo from "./logos/dia.png";

import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../context/ThemeContext";

import "./home.css";

const Home = () => {
  const { t } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);

  const [recommended, setRecommended] = useState([]);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState({ name: "", message: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ==========================
  // FETCH USER + RECOMMENDATIONS
  // ==========================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authAPI.get("/me");
        setUser(res.data);
        setComment((prev) => ({ ...prev, name: res.data.name }));
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const res = await productAPI.get("/recommended");
        setRecommended(res.data.slice(0, 6)); // show top 6
      } catch (err) {
        console.error("❌ Failed to fetch recommendations:", err);
      }
    };

    fetchUser();
    fetchRecommendations();
  }, [token]);

  // ==========================
  // COMMENT SUBMIT
  // ==========================
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    alert(t("commentSent"));

    setComment({ name: user?.name || "", message: "" });

    try {
      await commentAPI.post("/", {
        name: comment.name,
        message: comment.message,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("❌ Failed to submit comment:", err);
    }
  };

  return (
    <div className={`home-page ${theme}`}>
      {/* HERO */}
      <div className="home-hero">
        <h1 className="home-title">
          {t("welcomeUser", { name: user?.name || t("shopper") })}
        </h1>
        <p className="home-subtitle">
          {t("homeSubtitle", { name: user?.name || t("shopper") })}
        </p>
        <Link to="/compare" className="home-hero-btn">
          {t("startComparing")} →
        </Link>
      </div>

      {/* LOGO MARQUEE */}
      <div className="logo-wrapper">
        <div className="logo-track">
          {[mercadonaLogo, carrefourLogo, lidlLogo, diaLogo, mercadonaLogo, carrefourLogo, lidlLogo, diaLogo].map((logo, i) => (
            <div key={i} className="logo-container">
              <img src={logo} alt="logo" className="logo-img" />
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE GRID */}
      <div className="home-grid">
        <Link to="/compare" className="home-card">
          <h3>🔍 {t("searchProducts")}</h3>
          <p>{t("searchProductsDesc")}</p>
        </Link>

        <Link to="/products" className="home-card">
          <h3>⭐ {t("recommendedProducts")}</h3>
          <p>{t("recommendedProductsDesc")}</p>
        </Link>

        <Link to="/user-guide" className="home-card">
          <h3>📘 {t("userGuide")}</h3>
          <p>{t("userGuideDesc")}</p>
        </Link>
      </div>

      {/* COMMENT SECTION */}
      <div className="comment-section">
        <h3>💬 {t("leaveComment")}</h3>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <input
            type="text"
            value={comment.name}
            onChange={(e) => setComment({ ...comment, name: e.target.value })}
            placeholder={t("yourName")}
            required
            className="comment-input"
          />
          <textarea
            value={comment.message}
            onChange={(e) => setComment({ ...comment, message: e.target.value })}
            placeholder={t("yourComment")}
            required
            rows={4}
            className="comment-textarea"
          />
          <button type="submit" className="comment-submit">
            {t("sendFeedback")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
