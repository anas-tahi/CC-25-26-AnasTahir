import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productAPI, commentAPI, authAPI } from '../services/api';
import mercadonaLogo from './logos/mercadona.jpeg';
import carrefourLogo from './logos/carrefour.png';
import lidlLogo from './logos/lidl.png';
import diaLogo from './logos/dia.png';
import { LanguageContext } from '../context/LanguageContext';

const Home = () => {
  const { lang } = useContext(LanguageContext);
  const [recommended, setRecommended] = useState([]);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState({ name: '', message: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authAPI.get('/auth/me');
        setUser(res.data);
        setComment(prev => ({ ...prev, name: res.data.name }));
      } catch (err) {
        console.error('❌ Failed to fetch user:', err);
      }
    };
    const fetchRecommendations = async () => {
      try {
        const res = await productAPI.get('/recommendations');
        setRecommended(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch recommendations:', err);
      }
    };
    fetchUser();
    fetchRecommendations();
  }, [token]);

  const handleCompare = (name) => {
    navigate(`/compare?query=${encodeURIComponent(name)}`);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await commentAPI.post('/', comment);
      alert(lang === 'es' ? '✅ Comentario enviado!' : '✅ Comment submitted!');
      setComment({ name: user?.name || '', message: '' });
    } catch (err) {
      console.error('❌ Failed to submit comment:', err);
      alert(lang === 'es' ? '❌ Error al enviar comentario.' : '❌ Failed to submit comment.');
    }
  };

  const texts = {
    en: {
      welcome: `Welcome back, ${user?.name || 'Shopper'} 🛒`,
      subtitle: 'Compare supermarket prices in Granada and across Spain. Save money, shop smart, and stay informed.',
      searchProducts: 'Search Products',
      recommendedProducts: 'Recommended Products',
      userGuide: 'User Guide',
      leaveComment: 'Leave a Comment',
      sendFeedback: '🚀 Send Feedback',
    },
    es: {
      welcome: `¡Bienvenido, ${user?.name || 'Comprador'} 🛒`,
      subtitle: 'Compara precios de supermercados en Granada y toda España. Ahorra dinero, compra inteligente y mantente informado.',
      searchProducts: 'Buscar Productos',
      recommendedProducts: 'Productos Recomendados',
      userGuide: 'Guía de Usuario',
      leaveComment: 'Deja un Comentario',
      sendFeedback: '🚀 Enviar Comentario',
    },
  };

  const t = texts[lang];

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>{t.welcome}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>
        <Link to="/compare" style={styles.heroButton}>Start Comparing →</Link>
      </div>

      <div style={styles.logoRow}>
        {[mercadonaLogo, carrefourLogo, lidlLogo, diaLogo].map((logo, i) => (
          <div key={i} style={styles.logoContainer}>
            <img src={logo} alt={`Logo ${i}`} style={styles.logo} />
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        <Link to="/compare" style={styles.card}>
          <h3>🔍 {t.searchProducts}</h3>
          <p>Find any item and instantly compare prices across supermarkets.</p>
        </Link>

        <Link to="/products" style={styles.card}>
          <h3>⭐ {t.recommendedProducts}</h3>
          <p>See top picks and trending deals curated just for you.</p>
        </Link>

        <Link to="/user-guide" style={{ ...styles.card, textDecoration: 'none' }}>
          <h3>📘 {t.userGuide}</h3>
          <p>Learn how to use CompraSmart like a pro.</p>
        </Link>
      </div>

      <div style={styles.commentSection}>
        <h3>💬 {t.leaveComment}</h3>
        <form onSubmit={handleCommentSubmit} style={styles.form}>
          <input
            type="text"
            value={comment.name}
            onChange={(e) => setComment({ ...comment, name: e.target.value })}
            placeholder="Your name"
            required
            style={styles.input}
          />
          <textarea
            value={comment.message}
            onChange={(e) => setComment({ ...comment, message: e.target.value })}
            placeholder="Your comment"
            required
            rows={4}
            style={styles.textarea}
          />
          <button type="submit" style={styles.submitButton}>{t.sendFeedback}</button>
        </form>
      </div>
    </div>
  );
};

// Keep your styles the same as before (copied from previous Home.js)
const styles = {
  page: { background: 'linear-gradient(180deg, #f9fafc 0%, #f0f7ff 100%)', minHeight: '100vh', padding: '2rem', fontFamily: 'Poppins, sans-serif', textAlign: 'center' },
  hero: { animation: 'fadeIn 1.5s ease-in-out', marginBottom: '3rem' },
  title: { fontSize: '2.8rem', fontWeight: '700', color: '#222', marginBottom: '1rem' },
  subtitle: { fontSize: '1.2rem', color: '#555', maxWidth: '700px', margin: 'auto', marginBottom: '2rem', lineHeight: '1.6' },
  heroButton: { display: 'inline-block', padding: '0.8rem 1.8rem', background: 'linear-gradient(90deg, #007bff, #00d4ff)', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' },
  logoRow: { display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' },
  logoContainer: { transition: 'transform 0.4s ease' },
  logo: { height: '100px', objectFit: 'contain', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' },
  card: { padding: '1.8rem', borderRadius: '16px', backgroundColor: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.1)', textDecoration: 'none', color: '#333', transition: 'transform 0.3s ease, box-shadow 0.3s ease' },
  commentSection: { marginTop: '3rem', background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', maxWidth: '600px', marginInline: 'auto', textAlign: 'left' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', transition: 'box-shadow 0.3s ease' },
  textarea: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', transition: 'box-shadow 0.3s ease' },
  submitButton: { background: 'linear-gradient(90deg, #28a745, #85e085)', color: '#fff', border: 'none', padding: '0.8rem 1.6rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', transition: 'transform 0.2s ease' },
};

export default Home;
