import { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es'); // default language

  // Load saved language on first render
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language');
    if (savedLang) setLanguage(savedLang);
  }, []);

  // Save language whenever it changes
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  // Toggle between English and Spanish
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  // Helper to translate labels
  const t = (enText, esText) => (language === 'en' ? enText : esText);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
