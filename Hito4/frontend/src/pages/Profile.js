import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  getShoppingLists,
  deleteShoppingList,
} from "../api/shoppingLists";
import "../pages/profile.css";

const Profile = () => {
  const { user, fetchUser } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

  const [avatar, setAvatar] = useState(null);
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [errorLists, setErrorLists] = useState("");
  const navigate = useNavigate();

  // Load user avatar & lists
  useEffect(() => {
    if (user) {
      setAvatar(user.avatar || null);
      loadLists();
    } else {
      fetchUser();
    }
  }, [user, fetchUser]);

  const loadLists = async () => {
    try {
      setLoadingLists(true);
      setErrorLists("");
      const data = await getShoppingLists();
      setLists(data);
    } catch (err) {
      console.error(err);
      setErrorLists("Error loading your shopping lists.");
    } finally {
      setLoadingLists(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      // Optional: send to backend later
    };
    reader.readAsDataURL(file);
  };

  const handleLoadList = (id) => {
    navigate(`/shopping-list?listId=${id}`);
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm("Delete this list?")) return;
    try {
      await deleteShoppingList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
      setErrorLists("Error deleting the list.");
    }
  };

  if (!user) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      {/* Animations */}
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

      {/* Welcome Banner */}
      <div className="profile-banner">
        <h1 className="profile-banner-text">¡Bienvenido, {user.name}!</h1>
      </div>

      {/* Profile Info */}
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
            🖼️ Cambiar Avatar
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="profile-right">
          <h2 className="profile-welcome pulse">👋 Hola, {user.name}!</h2>
          <p className="profile-thank">
            Gracias por usar CompraSmart ❤️
          </p>
          <button onClick={handleLogout} className="profile-logout">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Shopping Lists */}
      <div className="profile-lists-section fade-in">
        <h2>Mis Listas de Compras</h2>

        {loadingLists && <p>Cargando tus listas...</p>}
        {errorLists && <p className="profile-error">{errorLists}</p>}
        {(!lists || lists.length === 0) && !loadingLists && !errorLists && (
          <p>No tienes listas guardadas aún.</p>
        )}

        <div className="profile-lists-grid">
          {lists.map((list) => (
            <div key={list.id} className="profile-list-card">
              <h3>{list.name}</h3>
              <p>
                Items: <strong>{list.items ? list.items.length : 0}</strong>
              </p>
              {list.createdAt && (
                <p className="profile-list-date">
                  Creada:{" "}
                  {new Date(list.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}

              <div className="profile-list-actions">
                <button
                  type="button"
                  onClick={() => handleLoadList(list.id)}
                  className="profile-list-btn"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteList(list.id)}
                  className="profile-list-btn profile-list-delete"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
