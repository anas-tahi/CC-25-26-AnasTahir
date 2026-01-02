import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';

const Profile = () => {
  const { user, fetchUser } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

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
      // Optional: send to backend
      // authAPI.put('/update-avatar', { avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (!user) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-container">
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

      {/* Banner */}
      <div className="profile-banner">
        <h1 className="profile-banner-text">Welcome, {user.name}!</h1>
      </div>

      {/* Profile Section */}
      <div className="profile-section fade-in">
        <div className="profile-left">
          {avatar ? (
            <img src={avatar} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-fallback">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <label className="profile-upload">
            🖼️ Upload
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="profile-right">
          <h2 className="profile-welcome pulse">
            👋 Hello, {user.name}!
          </h2>

          <p className="profile-thank">
            Thanks for using our app! We appreciate you being here ❤️
          </p>

          <button onClick={handleLogout} className="profile-logout">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
