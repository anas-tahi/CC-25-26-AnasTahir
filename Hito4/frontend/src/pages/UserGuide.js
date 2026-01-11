import React from "react";
import "./userguide.css"; // Import the premium CSS

const UserGuide = () => {
  return (
    <div className="guide-container">
      <h1 className="guide-title">📘 CompraSmart User Guide</h1>

      <p className="guide-text">
        Welcome to <strong>CompraSmart</strong> — your intelligent supermarket companion!  
        This guide explains how to use the website to create shopping lists, compare prices, save favorites, and navigate our microservices-powered system.
      </p>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">1. 🔐 Getting Started</h2>
      <p className="guide-text">
        To fully enjoy CompraSmart, create an account or log in. Authentication is secure and managed by our <strong>Auth Service</strong>.
      </p>

      <ul className="guide-list">
        <li>Register using your email and a strong password.</li>
        <li>Log in to access personalized features like your shopping lists and wishlist.</li>
        <li>Your session is stored securely using a JWT token.</li>
        <li>Profile management allows you to update your avatar, name, and password.</li>
      </ul>

      <h3 className="guide-subtitle">Auth API Endpoints</h3>
      <ul className="guide-list">
        <li><code>POST /auth/register</code> – Create a new user account</li>
        <li><code>POST /auth/login</code> – Log in</li>
        <li><code>GET /auth/me</code> – Retrieve current user data</li>
        <li><code>PUT /auth/update</code> – Update profile info</li>
        <li><code>PUT /auth/change-password</code> – Update password</li>
        <li><code>DELETE /auth/delete</code> – Delete your account</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">2. 🛒 Shopping Lists</h2>
      <p className="guide-text">
        Shopping lists are the heart of CompraSmart. You can create custom lists or use pre-defined lists for students or families.
      </p>

      <ul className="guide-list">
        <li>Create a new list by choosing "Create My Own List".</li>
        <li>Add products by searching in the search bar or selecting from recommendations.</li>
        <li>Compare prices across multiple supermarkets for the entire list.</li>
        <li>Save lists to your profile for easy access later.</li>
      </ul>

      <h3 className="guide-subtitle">Shopping List Features</h3>
      <ul className="guide-list">
        <li>Autocomplete search for fast product entry.</li>
        <li>Compare total prices across supermarkets to find the cheapest option.</li>
        <li>View store locations on an interactive map.</li>
        <li>Save and edit lists from your profile.</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">3. 🔎 Product Comparison</h2>
      <p className="guide-text">
        Compare individual products to find the best price. The <strong>Product Service</strong> provides live price data across supermarkets.
      </p>

      <ul className="guide-list">
        <li>Search for a product by name.</li>
        <li>See prices from all supermarkets offering that product.</li>
        <li>Identify the cheapest option instantly.</li>
        <li>View the supermarket location directly on the map.</li>
      </ul>

      <h3 className="guide-subtitle">Product API Endpoints</h3>
      <ul className="guide-list">
        <li><code>GET /products</code> – Fetch all products</li>
        <li><code>GET /products/recommendations</code> – Recommended products</li>
        <li><code>GET /products/names/:prefix</code> – Autocomplete search</li>
        <li><code>GET /products/compare/:name</code> – Compare a specific product</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">4. ❤️ Wishlist (Favorites)</h2>
      <p className="guide-text">
        Save your favorite products or the cheapest options to your wishlist for quick access later.
      </p>

      <ul className="guide-list">
        <li>Add products to your wishlist while browsing or comparing.</li>
        <li>View all wishlist items in the Favorites page.</li>
        <li>Remove items easily when they are no longer needed.</li>
      </ul>

      <h3 className="guide-subtitle">Wishlist API Endpoints</h3>
      <ul className="guide-list">
        <li><code>POST /wishlist</code> – Add a product</li>
        <li><code>GET /wishlist</code> – List all saved items</li>
        <li><code>DELETE /wishlist/:id</code> – Remove a product</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">5. 💬 Comments & Feedback</h2>
      <p className="guide-text">
        Share feedback about products or the app. Comments are handled by the <strong>Comment Service</strong>.
      </p>

      <ul className="guide-list">
        <li>Leave comments on the Home page for suggestions or reviews.</li>
        <li>View all comments submitted by users.</li>
      </ul>

      <h3 className="guide-subtitle">Comment API Endpoints</h3>
      <ul className="guide-list">
        <li><code>POST /comments</code> – Submit a comment</li>
        <li><code>GET /comments</code> – Retrieve all comments</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">6. 🧭 Navigation Overview</h2>
      <p className="guide-text">
        The navigation bar helps you access all the main sections quickly:
      </p>

      <ul className="guide-list">
        <li><strong>Home</strong> – View recommendations and latest comments</li>
        <li><strong>Products</strong> – Explore recommended products</li>
        <li><strong>Compare</strong> – Compare prices across supermarkets</li>
        <li><strong>Favorites</strong> – Access saved wishlist items</li>
        <li><strong>Profile</strong> – Edit avatar, manage lists</li>
        <li><strong>Settings</strong> – Update account info or password</li>
        <li><strong>User Guide</strong> – This page with detailed instructions</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">7. 🌍 System Architecture</h2>
      <p className="guide-text">
        CompraSmart is built with a modular microservices architecture for reliability and scalability:
      </p>

      <ul className="guide-list">
        <li><strong>Auth Service</strong> – Handles authentication & accounts</li>
        <li><strong>Product Service</strong> – Manages products, lists, comparisons, wishlist</li>
        <li><strong>Comment Service</strong> – Manages comments and feedback</li>
        <li><strong>Frontend</strong> – React SPA providing a smooth user experience</li>
      </ul>

      <hr className="guide-divider" />

      <h2 className="guide-section-title">8. 📝 Tips & Best Practices</h2>
      <ul className="guide-list">
        <li>Log in to access all features and save your lists.</li>
        <li>Use the Compare feature for cost-effective shopping.</li>
        <li>Allow location access for accurate store maps.</li>
        <li>Regularly check favorites to track price changes.</li>
        <li>Customize your shopping lists to match your needs.</li>
      </ul>

      <p className="guide-text">Enjoy smart shopping with CompraSmart! 🚀</p>
    </div>
  );
};

export default UserGuide;
