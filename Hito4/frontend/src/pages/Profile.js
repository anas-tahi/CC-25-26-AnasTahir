import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { UserContext } from "../context/UserContext";
import "./profile.css";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const token = localStorage.getItem("token");

  const [lists, setLists] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

  // LOAD LISTS
  const loadLists = async () => {
    try {
      const res = await axios.get(
        "https://auth-service-a73r.onrender.com/shopping-lists",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLists(res.data);
    } catch {
      Swal.fire("Error", "Error loading your shopping lists", "error");
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  // DELETE LIST
  const deleteList = async (id) => {
    try {
      await axios.delete(
        `https://auth-service-a73r.onrender.com/shopping-lists/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadLists();
    } catch {
      Swal.fire("Error", "Error deleting list", "error");
    }
  };

  // AVATAR UPLOAD
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await axios.put(
          "https://auth-service-a73r.onrender.com/auth/avatar",
          { avatar: reader.result },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
        setAvatarPreview(res.data.avatar);
      } catch {
        Swal.fire("Error", "Failed to update avatar", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-container">
      {/* WELCOME SECTION */}
      <div className="profile-welcome-section">
        <div className="profile-avatar-box">
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="avatar"
            className="profile-avatar"
          />
          <label className="upload-btn">
            Change Photo
            <input type="file" hidden onChange={handleAvatarChange} />
          </label>
        </div>
        <div className="profile-welcome-text">
          <h1>Welcome back, {user?.name} 👋</h1>
          <p>Glad to see you! Here's your shopping dashboard.</p>
        </div>
      </div>

      {/* SHOPPING LISTS */}
      <h2 className="profile-lists-title">My Shopping Lists</h2>
      {lists.length === 0 && <p className="profile-empty">No lists saved yet.</p>}

      <div className="profile-lists-grid">
        {lists.map((list) => (
          <div key={list._id} className="profile-list-card">
            <h3>{list.name}</h3>
            <p>Items: {list.items.length}</p>
            <p>Created: {new Date(list.createdAt).toLocaleDateString()}</p>
            <div className="profile-list-actions">
              <button
                className="profile-list-btn"
                onClick={() =>
                  window.location.assign(`/shopping-list?load=${list._id}`)
                }
              >
                Edit
              </button>
              <button
                className="profile-list-btn profile-list-delete"
                onClick={() => deleteList(list._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* LOGOUT BUTTON */}
      <button
        className="profile-logout"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
