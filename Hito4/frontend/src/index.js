import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { UserProvider } from "./context/UserContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FavoritesProvider } from "./context/FavoritesContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider>
    <LanguageProvider>
      <UserProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </UserProvider>
    </LanguageProvider>
  </ThemeProvider>
);
