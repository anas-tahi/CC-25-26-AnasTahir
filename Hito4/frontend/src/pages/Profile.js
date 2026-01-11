import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { authAPI } from "../services/api";
import { UserContext } from "../context/UserContext";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../context/ThemeContext";
import "./profile.css";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const { language, t } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);

  const token = localStorage.getItem("token");

  const [lists, setLists] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

  // ================= LOAD LISTS =================
  const loadLists = async () => {
    try {
      const res = await authAPI.get("/../shopping-lists");
      setLists(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire(t("Error", "Error"), t("Error loading your shopping lists", "Error al cargar tus listas"), "error");
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  // ================= DELETE LIST =================
  const deleteList = async (id) => {
    try {
      await authAPI.delete(`/../shopping-lists/${id}`);
      loadLists();
    } catch {
      Swal.fire(t("Error", "Error"), t("Error deleting list", "Error al eliminar la lista"), "error");
    }
  };

  // ================= AVATAR UPLOAD =================
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire(t("Error", "Error"), t("Please upload an image file", "Por favor sube una imagen"), "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await authAPI.put("/avatar", { avatar: reader.result });
        setUser(res.data);
        setAvatarPreview(res.data.avatar);
        Swal.fire(t("Success", "Éxito"), t("Profile photo updated!", "Foto de perfil actualizada"), "success");
      } catch (err) {
        console.error("Avatar upload error:", err);
        Swal.fire(t("Error", "Error"), t("Failed to update avatar", "Error al actualizar avatar"), "error");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`profile-container ${theme}`}>
      {/* ===== WELCOME ===== */}
      <div className="profile-welcome-section">
        <div className="profile-avatar-box">
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="avatar"
            className="profile-avatar"
          />
          <label className="upload-btn">
            {t("Change Photo", "Cambiar foto")}
            <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>

        <div className="profile-welcome-text">
          <h1>{t(`Welcome back, ${user?.name} 👋`, `¡Bienvenido de nuevo, ${user?.name} 👋`)}</h1>
          <p>{t("Manage your shopping lists and profile settings", "Gestiona tus listas y ajustes")}</p>
        </div>
      </div>

      {/* ===== SHOPPING LISTS ===== */}
      <h2 className="profile-lists-title">{t("My Shopping Lists", "Mis listas")}</h2>

      {lists.length === 0 && (
        <p className="profile-empty">{t("No lists saved yet.", "Aún no hay listas guardadas.")}</p>
      )}

      <div className="profile-lists-grid">
        {lists.map((list) => (
          <div key={list._id} className="profile-list-card">
            <h3>{list.name}</h3>
            <p>{t("Items", "Artículos")}: {list.items.length}</p>
            <p>{t("Created", "Creado")}: {new Date(list.createdAt).toLocaleDateString()}</p>

            <div className="profile-list-actions">
              <button
                className="profile-list-btn"
                onClick={() => window.location.assign(`/shopping-list?load=${list._id}`)}
              >
                {t("Edit", "Editar")}
              </button>
              <button
                className="profile-list-btn profile-list-delete"
                onClick={() => deleteList(list._id)}
              >
                {t("Delete", "Eliminar")}
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
          window.location.href = "/login";
        }}
      >
        {t("Logout", "Salir")}
      </button>
    </div>
  );
};

export default Profile;
