import React from "react";

const UserGuide = () => {
  return (
    <div className="guide-container">
      <h1 className="guide-title">📘 CompraSmart User Guide</h1>

      <p className="guide-text">
        Welcome to <strong>CompraSmart</strong> — your smart supermarket comparison tool.
        This guide explains how to use every feature of the app and how it interacts with
        the backend microservices.
      </p>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">1. 🔐 Authentication</h2>
      <p className="guide-text">
        Authentication is handled by the <strong>Auth Service</strong>.
      </p>

      <ul className="guide-list">
        <li>Create an account using the <strong>Register</strong> page.</li>
        <li>Log in with your email and password.</li>
        <li>Once logged in, you gain access to all protected features.</li>
        <li>Your session is stored using a secure JWT token.</li>
      </ul>

      <h3 className="guide-subtitle">Available Auth Endpoints</h3>
      <ul className="guide-list">
        <li><code>POST /auth/register</code> – Create a new user</li>
        <li><code>POST /auth/login</code> – Log in</li>
        <li><code>GET /auth/me</code> – Get current user</li>
        <li><code>PUT /auth/update</code> – Update profile</li>
        <li><code>PUT /auth/change-password</code> – Change password</li>
        <li><code>DELETE /auth/delete</code> – Delete account</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">2. 🛒 Products & Price Comparison</h2>
      <p className="guide-text">
        Product data and price comparison are handled by the <strong>Product Service</strong>.
      </p>

      <h3 className="guide-subtitle">Features</h3>
      <ul className="guide-list">
        <li>Browse recommended products</li>
        <li>Search products by name prefix</li>
        <li>Compare prices across supermarkets</li>
        <li>View the cheapest supermarket for each product</li>
        <li>See the store location on an interactive map</li>
      </ul>

      <h3 className="guide-subtitle">Available Product Endpoints</h3>
      <ul className="guide-list">
        <li><code>GET /products</code> – Get all products</li>
        <li><code>GET /products/recommendations</code> – Recommended products</li>
        <li><code>GET /products/names</code> – All product names</li>
        <li><code>GET /products/names/:prefix</code> – Autocomplete suggestions</li>
        <li><code>GET /products/compare/:name</code> – Compare product prices</li>
        <li><code>GET /products/compare-all</code> – Compare all products</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">3. ❤️ Wishlist (Favorites)</h2>
      <p className="guide-text">
        The wishlist is also managed by the <strong>Product Service</strong>.
        You can save the cheapest product from any comparison.
      </p>

      <h3 className="guide-subtitle">Available Wishlist Endpoints</h3>
      <ul className="guide-list">
        <li><code>POST /wishlist</code> – Add product to wishlist</li>
        <li><code>GET /wishlist</code> – Get all wishlist items</li>
        <li><code>DELETE /wishlist/:id</code> – Remove item from wishlist</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">4. 💬 Comments</h2>
      <p className="guide-text">
        Comments are handled by the <strong>Comment Service</strong>.
        You can leave feedback directly from the Home page.
      </p>

      <h3 className="guide-subtitle">Available Comment Endpoints</h3>
      <ul className="guide-list">
        <li><code>POST /comments</code> – Submit a comment</li>
        <li><code>GET /comments</code> – Retrieve all comments</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">5. 🧭 Navigation</h2>
      <p className="guide-text">The main navigation bar gives you access to:</p>

      <ul className="guide-list">
        <li><strong>Home</strong> – Overview, recommendations, comments</li>
        <li><strong>Products</strong> – Recommended items</li>
        <li><strong>Compare</strong> – Search and compare prices</li>
        <li><strong>Favorites</strong> – Your saved wishlist</li>
        <li><strong>Settings</strong> – Profile and password management</li>
        <li><strong>Profile</strong> – Avatar and personal info</li>
        <li><strong>User Guide</strong> – This page</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">6. 🌍 Microservices Architecture</h2>
      <p className="guide-text">CompraSmart is built using a modern microservices architecture:</p>

      <ul className="guide-list">
        <li><strong>Auth Service</strong> – User accounts & authentication</li>
        <li><strong>Product Service</strong> – Products, comparisons, wishlist</li>
        <li><strong>Comment Service</strong> – User feedback</li>
        <li><strong>Frontend</strong> – React application</li>
      </ul>

      <p className="guide-text">
        Each service is deployed independently on Render and communicates via REST APIs.
      </p>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">7. 📝 Tips</h2>

      <ul className="guide-list">
        <li>Ensure you are logged in to access protected pages.</li>
        <li>Use the Compare page for the most accurate price insights.</li>
        <li>Allow location access for better map accuracy.</li>
        <li>Use the wishlist to save the cheapest products.</li>
      </ul>

      <p className="guide-text">Enjoy using CompraSmart! 🚀</p>
    </div>
  );
};

export default UserGuide;
