// src/components/LanguageToggle.js
import { useState } from 'react';

const LanguageToggle = () => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    // Later: i18n.changeLanguage(newLang);
  };

  return (
    <button onClick={toggleLanguage}>
      🌐 Language: {language === 'en' ? 'English' : 'Español'}
    </button>
  );
};

export default LanguageToggle;
