import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export default function LanguageDropdown() {
  const { lang, changeLanguage } = useContext(LanguageContext);

  return (
    <select
      value={lang}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px"
      }}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
