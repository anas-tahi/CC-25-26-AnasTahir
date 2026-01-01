import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';   // ⭐ NEW
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, setUser, fetchUser } = useContext(UserContext); // ⭐ NEW
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  // ⭐ Load user from context instead of fetching manually
  useEffect(() => {
    if (user) {
      setAvatar(user.avatar || null);
    } else {
      fetchUser();
    }
  }, [user, fetchUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);

      // Optional: send avatar to backend
      // authAPI.put('/update-avatar', { avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (!user) return <div style={styles.loading}>Loading profile...</div>;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes pulseText {
          0%, 100% { transform: scale(1);}
          50% { transform: scale(1.03);}
        }
        .fade-in { animation: fadeInUp 0.7s ease forwards;}
        .pulse { animation: pulseText 2s infinite;}
      `}</style>

      <div style={styles.banner}>
        <h1 style={styles.bannerText}>Welcome, {user.name}!</h1>
      </div>

      <div style={styles.profileSection} className="fade-in">
        <div style={styles.left}>
          {avatar ? (
            <img src={avatar} alt="Profile" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarFallback}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <label style={styles.uploadLabel}>
            🖼️ Upload
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div style={styles.right}>
          <h2 style={{ ...styles.welcome, className: 'pulse' }}>
            👋 Hello, {user.name}!
          </h2>
          <p style={styles.thank}>
            Thanks for using our app! We appreciate you being here ❤️
          </p>
          <button onClick={handleLogout} style={styles.logout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    fontFamily: 'sans-serif',
  },
  banner: {
    width: '100%',
    height: '250px',
    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexDirection: 'column',
    textAlign: 'center',
  },
  bannerText: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: 0,
  },
  profileSection: {
    display: 'flex',
    width: '100%',
    padding: '3rem 5%',
    gap: '5%',
    backgroundColor: '#f5f7fa',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  left: {
    flex: '1 1 250px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  right: {
    flex: '2 1 400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  avatarFallback: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: '#007bff33',
    color: '#007bff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '4rem',
    fontWeight: 'bold',
  },
  avatarImg: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  uploadLabel: {
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid #007bff',
    color: '#007bff',
    fontSize: '1rem',
    backgroundColor: '#fff',
    transition: 'all 0.3s ease',
  },
  welcome: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#333',
    animation: 'pulseText 2s infinite',
  },
  thank: {
    fontSize: '1.2rem',
    color: '#555',
  },
  logout: {
    marginTop: '1rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.8rem 2rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    width: 'fit-content',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
  },
};

export default Profile;
