import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productAPI, commentAPI, authAPI } from '../services/api';
import mercadonaLogo from './logos/mercadona.jpeg';
import carrefourLogo from './logos/carrefour.png';
import lidlLogo from './logos/lidl.png';
import diaLogo from './logos/dia.png';

const Home = () => {
  const [recommended, setRecommended] = useState([]); // Using recommended state
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
      alert('✅ Comment submitted!');
      setComment({ name: user?.name || '', message: '' });
    } catch (err) {
      console.error('❌ Failed to submit comment:', err);
      alert('❌ Failed to submit comment.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Welcome back, {user?.name || 'Shopper'} 🛒</h1>
        <p style={styles.subtitle}>
          Compare supermarket prices in Granada and across Spain. Save money, shop smart, and stay informed.
        </p>
        <Link to="/compare" style={styles.heroButton}>Start Comparing →</Link>
      </div>

      <div style={styles.logoRow}>
        {[mercadonaLogo, carrefourLogo, lidlLogo, diaLogo].map((logo, i) => (
          <div
            key={i}
            style={styles.logoContainer}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2) rotate(3deg)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0) rotate(0deg)'}
          >
            <img src={logo} alt={`Logo ${i}`} style={styles.logo} />
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        <Link to="/compare" style={styles.card}>
          <h3>🔍 Search Products</h3>
          <p>Find any item and instantly compare prices across supermarkets.</p>
        </Link>

        <Link to="/products" style={styles.card}>
          <h3>⭐ Recommended Products</h3>
          <p>See top picks and trending deals curated just for you.</p>
        </Link>

        <a href="/guide.pdf" target="_blank" rel="noopener noreferrer" style={{ ...styles.card, textDecoration: 'none' }}>
          <h3>📘 User Guide</h3>
          <p>Learn how to use CompraSmart like a pro.</p>
        </a>
      </div>

      <div style={styles.commentSection}>
        <h3>💬 Leave a Comment</h3>
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
          <button type="submit" style={styles.submitButton}>🚀 Send Feedback</button>
        </form>
      </div>

      <div style={styles.socialRow}>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style={styles.socialIcon} />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="GitHub" style={styles.socialIcon} />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" style={styles.socialIcon} />
        </a>
      </div>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} CompraSmart — Smarter Shopping Made Simple 🛍️</p>
      </footer>
    </div>
  );
};

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
  socialRow: { marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '2rem' },
  socialIcon: { width: '48px', height: '48px', transition: 'transform 0.3s ease, filter 0.3s ease', cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' },
  footer: { marginTop: '3rem', fontSize: '0.9rem', color: '#666' },
};

document.head.insertAdjacentHTML(
  'beforeend',
  `<style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    a:hover, button:hover, img:hover {
      transform: scale(1.05);
    }
  </style>`
);

export default Home;
