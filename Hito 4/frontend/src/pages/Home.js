import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { productAPI, commentAPI, authAPI } from "../services/api";

import mercadonaLogo from "./logos/mercadona.jpeg";
import carrefourLogo from "./logos/carrefour.png";
import lidlLogo from "./logos/lidl.png";
import diaLogo from "./logos/dia.png";

import { LanguageContext } from "../context/LanguageContext";

import "./home.css"; // ⭐ NEW — imports your cleaned CSS

const Home = () => {
  const { lang } = useContext(LanguageContext);

  const [recommended, setRecommended] = useState([]);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState({ name: "", message: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ============================
  // FETCH USER + RECOMMENDATIONS
  // ============================
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
        const res = await productAPI.get("/recommendations");
        setRecommended(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch recommendations:", err);
      }
    };

    fetchUser();
    fetchRecommendations();
  }, [token]);

  // ============================
  // NAVIGATE TO COMPARE
  // ============================
  const handleCompare = (name) => {
    navigate(`/compare?query=${encodeURIComponent(name)}`);
  };

  // ============================
  // SUBMIT COMMENT
  // ============================
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    try {
      await commentAPI.post("/", comment);

      alert(lang === "es" ? "✅ Comentario enviado!" : "✅ Comment submitted!");

      setComment({ name: user?.name || "", message: "" });
    } catch (err) {
      console.error("❌ Failed to submit comment:", err);

      alert(
        lang === "es"
          ? "❌ Error al enviar comentario."
          : "❌ Failed to submit comment."
      );
    }
  };

  // ============================
  // TEXTS
  // ============================
  const texts = {
    en: {
      welcome: `Welcome back, ${user?.name || "Shopper"} 🛒`,
      subtitle:
        "Compare supermarket prices in Granada and across Spain. Save money, shop smart, and stay informed.",
      searchProducts: "Search Products",
      recommendedProducts: "Recommended Products",
      userGuide: "User Guide",
      leaveComment: "Leave a Comment",
      sendFeedback: "🚀 Send Feedback",
    },
    es: {
      welcome: `¡Bienvenido, ${user?.name || "Comprador"} 🛒`,
      subtitle:
        "Compara precios de supermercados en Granada y toda España. Ahorra dinero, compra inteligente y mantente informado.",
      searchProducts: "Buscar Productos",
      recommendedProducts: "Productos Recomendados",
      userGuide: "Guía de Usuario",
      leaveComment: "Deja un Comentario",
      sendFeedback: "🚀 Enviar Comentario",
    },
  };

  const t = texts[lang];

  // ============================
  // RENDER
  // ============================
  return (
    <div className="home-page">
      {/* HERO */}
      <div className="home-hero">
        <h1 className="home-title">{t.welcome}</h1>
        <p className="home-subtitle">{t.subtitle}</p>

        <Link to="/compare" className="home-hero-btn">
          Start Comparing →
        </Link>
      </div>

      {/* LOGO MARQUEE */}
      <div className="logo-wrapper">
        <div className="logo-track">
          {[
            mercadonaLogo,
            carrefourLogo,
            lidlLogo,
            diaLogo,
            mercadonaLogo,
            carrefourLogo,
            lidlLogo,
            diaLogo,
          ].map((logo, i) => (
            <div key={i} className="logo-container">
              <img src={logo} alt={`Logo ${i}`} className="logo-img" />
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE GRID */}
      <div className="home-grid">
        <Link to="/compare" className="home-card">
          <h3>🔍 {t.searchProducts}</h3>
          <p>Find any item and instantly compare prices across supermarkets.</p>
        </Link>

        <Link to="/products" className="home-card">
          <h3>⭐ {t.recommendedProducts}</h3>
          <p>See top picks and trending deals curated just for you.</p>
        </Link>

        <Link to="/user-guide" className="home-card">
          <h3>📘 {t.userGuide}</h3>
          <p>Learn how to use CompraSmart like a pro.</p>
        </Link>
      </div>

      {/* COMMENT SECTION */}
      <div className="comment-section">
        <h3>💬 {t.leaveComment}</h3>

        <form onSubmit={handleCommentSubmit} className="comment-form">
          <input
            type="text"
            value={comment.name}
            onChange={(e) =>
              setComment({ ...comment, name: e.target.value })
            }
            placeholder="Your name"
            required
            className="comment-input"
          />

          <textarea
            value={comment.message}
            onChange={(e) =>
              setComment({ ...comment, message: e.target.value })
            }
            placeholder="Your comment"
            required
            rows={4}
            className="comment-textarea"
          />

          <button type="submit" className="comment-submit">
            {t.sendFeedback}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
