import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // ✅ import useNavigate
import { authAPI } from "../services/api";
import { UserContext } from "../context/UserContext";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../context/ThemeContext";
import "./profile.css";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const { t } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate(); // ✅ initialize navigate

  const [lists, setLists] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

  // Load shopping lists
  const loadLists = async () => {
    try {
      const res = await authAPI.get("/../shopping-lists");
      setLists(res.data);
    } catch {
      Swal.fire(t("error"), t("errorLoadingLists"), "error");
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  // Delete a shopping list
  const deleteList = async (id) => {
    try {
      await authAPI.delete(`/../shopping-lists/${id}`);
      loadLists();
    } catch {
      Swal.fire(t("error"), t("errorDeletingList"), "error");
    }
  };

  // Upload avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire(t("error"), t("uploadImage"), "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await authAPI.put("/avatar", { avatar: reader.result });
        setUser(res.data);
        setAvatarPreview(res.data.avatar);
        Swal.fire(t("success"), t("avatarUpdated"), "success");
      } catch {
        Swal.fire(t("error"), t("error"), "error");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`profile-container ${theme}`}>
      {/* ===== WELCOME SECTION ===== */}
      <div className="profile-welcome-section">
        <div className="profile-avatar-box">
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="avatar"
            className="profile-avatar"
          />
          <label className="upload-btn">
            {t("changePhoto")}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="profile-welcome-text">
          <h1>
            {t("welcome")}, {user?.name} 👋
          </h1>
          <p>{t("manageLists")}</p>
        </div>
      </div>

      {/* ===== SHOPPING LISTS ===== */}
      <h2 className="profile-lists-title">{t("shoppingLists")}</h2>

      {lists.length === 0 && <p className="profile-empty">{t("noLists")}</p>}

      <div className="profile-lists-grid">
        {lists.map((list) => (
          <div key={list._id} className="profile-list-card">
            <h3>{list.name}</h3>
            <p>
              {t("items")}: {list.items.length}
            </p>
            <p>
              {t("created")}: {new Date(list.createdAt).toLocaleDateString()}
            </p>

            <div className="profile-list-actions">
              <button
                className="profile-list-btn"
                onClick={() => {
                  // ✅ navigate inside React instead of hard reload
                  navigate(`/shopping-list?load=${list._id}`);
                }}
              >
                {t("edit")}
              </button>
              <button
                className="profile-list-btn profile-list-delete"
                onClick={() => deleteList(list._id)}
              >
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== LOGOUT ===== */}
      <button
        className="profile-logout"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login"); // ✅ also use navigate here
        }}
      >
        {t("logout")}
      </button>
    </div>
  );
};

export default Profile;
