import { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('es'); // default language

  // Load saved language on first render
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language');
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  // Save language whenever it changes
  useEffect(() => {
    localStorage.setItem('app-language', lang);
  }, [lang]);

  // Change language from dropdown
  const changeLanguage = (newLang) => {
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
