import React from "react";
import "./userguide.css";

const UserGuide = () => {
  return (
    <div className="guide-container">
      <h1 className="guide-title">📘 CompraSmart User Guide</h1>

      <p className="guide-text">
        Welcome to <strong>CompraSmart</strong> — your intelligent supermarket companion!  
        This guide explains how to navigate the website, manage shopping lists, compare prices, save favorites, and interact with our microservices-powered system.
      </p>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">1. 🔐 Getting Started</h2>
      <p className="guide-text">
        Create an account or log in to fully enjoy CompraSmart:
      </p>
      <ul className="guide-list">
        <li>Register with Name, Email, and Password (future: email confirmation).</li>
        <li>Log in to access personalized features: shopping lists, wishlist, compare.</li>
        <li>Your session is secured with JWT tokens.</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">2. 🧭 Navigation Overview</h2>
      <p className="guide-text">
        The navigation bar and main page buttons let you access all features quickly.
      </p>

      {/* Navigation Flow Diagram */}
      <div className="flowchart">
        <div className="flow-node">Home / Inicio</div>
        <div className="flow-connector">↓</div>
        <div className="flow-node">Products (Recommended)</div>
        <div className="flow-connector">↓</div>
        <div className="flow-node">Compare Product Prices</div>
        <div className="flow-connector">↓</div>
        <div className="flow-node">Mis Listas (Custom + Recommended Lists)</div>
        <div className="flow-connector">↓</div>
        <div className="flow-node">Wishlist / Favorites</div>
        <div className="flow-connector">↓</div>
        <div className="flow-node">Profile & Account Settings</div>
      </div>

      <p className="guide-text" style={{ marginTop: "15px" }}>
        Quick navigation via navbar or buttons lets you access Home, Products, Compare, Lists, Wishlist, and Profile sections seamlessly.
      </p>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">3. 🔍 Searching Products</h2>
      <ul className="guide-list">
        <li>Search bar supports autocomplete for fast product entry.</li>
        <li>Click a product to see prices across supermarkets and map location.</li>
      </ul>

      <h3 className="guide-subtitle">Recommended Products ⭐</h3>
      <ul className="guide-list">
        <li>Random products for inspiration (future: show supermarket offers).</li>
        <li>Click the ❤️ icon to save products to your favorites.</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">4. 🛒 Compare Product Prices</h2>
      <ul className="guide-list">
        <li>Search and select a product to compare prices.</li>
        <li>See the cheapest supermarket and location on the map (future: improved map UX).</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">5. 📋 Mis Listas (Compare Lists)</h2>
      <ul className="guide-list">
        <li>Predefined lists: Students, Families (future: customizable options).</li>
        <li>Custom list: Name it, add products, compare total prices across supermarkets.</li>
        <li>Save lists to your profile for future use.</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">6. ❤️ Wishlist (Favorites)</h2>
      <ul className="guide-list">
        <li>Add/remove products while browsing or comparing.</li>
        <li>Access all wishlist items on the Favorites page.</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">7. 💬 Comments & Feedback</h2>
      <ul className="guide-list">
        <li>Leave feedback in the Home page comments section.</li>
        <li>Comments stored in the <strong>Comment Service</strong> database.</li>
        <li>Future: Admin panel for separate comment management.</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">8. 👤 User Profile</h2>
      <ul className="guide-list">
        <li>Profile picture, welcome text, access to "Mis Listas".</li>
        <li>Logout button for account security.</li>
      </ul>

      <h3 className="guide-subtitle">⚙️ Account Settings</h3>
      <ul className="guide-list">
        <li>📝 Edit profile info (name, avatar, email)</li>
        <li>🔐 Change password</li>
        <li>🗑️ Delete account (“Danger Zone”)</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">9. 🌍 System Architecture</h2>
      <ul className="guide-list">
        <li><strong>Auth Service</strong> – Authentication & account management</li>
        <li><strong>Product Service</strong> – Products, lists, comparisons, wishlist</li>
        <li><strong>Comment Service</strong> – Feedback & comments</li>
        <li><strong>Frontend</strong> – React SPA for smooth UX</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">10. 📝 Tips & Best Practices</h2>
      <ul className="guide-list">
        <li>Log in to save lists and favorites.</li>
        <li>Use Compare to find cost-effective options.</li>
        <li>Allow location access for accurate map results.</li>
        <li>Check favorites regularly for price updates.</li>
        <li>Customize your shopping lists to match your needs.</li>
      </ul>

      <p className="guide-text">Enjoy smart shopping with <strong>CompraSmart</strong>! 🚀</p>
    </div>
  );
};

export default UserGuide;
