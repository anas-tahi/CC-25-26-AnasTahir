// src/context/LanguageContext.jsx
import { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

// All translation keys used in your app
const translations = {
  en: {
    welcome: "Welcome",
    home: "Home",
    profile: "Profile",
    settings: "Settings",
    favorites: "Favorites",
    logout: "Logout",
    shoppingLists: "My Shopping Lists",
    noLists: "No lists saved yet.",
    items: "Items",
    created: "Created",
    edit: "Edit",
    delete: "Delete",
    changePhoto: "Change Photo",
    manageLists: "Manage your shopping lists and profile settings",
    success: "Success",
    error: "Error",
    avatarUpdated: "Profile photo updated!",
    uploadImage: "Please upload an image file",
    errorLoadingLists: "Error loading your shopping lists",
    errorDeletingList: "Error deleting list",
    welcomeToast: "Welcome to CompraSmart!"
  },
  es: {
    welcome: "¡Bienvenido!",
    home: "Inicio",
    profile: "Perfil",
    settings: "Ajustes",
    favorites: "Favoritos",
    logout: "Salir",
    shoppingLists: "Mis listas",
    noLists: "Aún no hay listas guardadas.",
    items: "Artículos",
    created: "Creado",
    edit: "Editar",
    delete: "Eliminar",
    changePhoto: "Cambiar foto",
    manageLists: "Gestiona tus listas y ajustes",
    success: "Éxito",
    error: "Error",
    avatarUpdated: "Foto de perfil actualizada",
    uploadImage: "Por favor sube una imagen",
    errorLoadingLists: "Error al cargar tus listas",
    errorDeletingList: "Error al eliminar la lista",
    welcomeToast: "¡Bienvenido a CompraSmart!"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("es"); // default language

  // Load saved language on first render
  useEffect(() => {
    const savedLang = localStorage.getItem("app-language");
    if (savedLang) setLang(savedLang);
  }, []);

  // Save language whenever it changes
  useEffect(() => {
    localStorage.setItem("app-language", lang);
  }, [lang]);

  // Toggle between English and Spanish
  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "es" : "en"));
  };

  // Translation function
  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
