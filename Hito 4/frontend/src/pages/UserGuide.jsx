import React from "react";

const UserGuide = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", lineHeight: "1.7" }}>
      <h1>📘 CompraSmart User Guide</h1>
      <p>
        Welcome to <strong>CompraSmart</strong> — your smart supermarket comparison tool.
        This guide explains how to use every feature of the app and how it interacts with
        the backend microservices.
      </p>

      <hr />

      <h2>1. 🔐 Authentication</h2>
      <p>Authentication is handled by the <strong>Auth Service</strong>.</p>
      <ul>
        <li>Create an account using the <strong>Register</strong> page.</li>
        <li>Log in with your email and password.</li>
        <li>Once logged in, you gain access to all protected features.</li>
        <li>Your session is stored using a secure JWT token.</li>
      </ul>

      <h3>Available Auth Endpoints</h3>
      <ul>
        <li><code>POST /auth/register</code> – Create a new user</li>
        <li><code>POST /auth/login</code> – Log in</li>
        <li><code>GET /auth/me</code> – Get current user</li>
        <li><code>PUT /auth/update</code> – Update profile</li>
        <li><code>PUT /auth/change-password</code> – Change password</li>
        <li><code>DELETE /auth/delete</code> – Delete account</li>
      </ul>

      <hr />

      <h2>2. 🛒 Products & Price Comparison</h2>
      <p>
        Product data and price comparison are handled by the <strong>Product Service</strong>.
      </p>

      <h3>Features</h3>
      <ul>
        <li>Browse recommended products</li>
        <li>Search products by name prefix</li>
        <li>Compare prices across supermarkets</li>
        <li>View the cheapest supermarket for each product</li>
        <li>See the store location on an interactive map</li>
      </ul>

      <h3>Available Product Endpoints</h3>
      <ul>
        <li><code>GET /products</code> – Get all products</li>
        <li><code>GET /products/recommendations</code> – Recommended products</li>
        <li><code>GET /products/names</code> – All product names</li>
        <li><code>GET /products/names/:prefix</code> – Autocomplete suggestions</li>
        <li><code>GET /products/compare/:name</code> – Compare product prices</li>
        <li><code>GET /products/compare-all</code> – Compare all products</li>
      </ul>

      <hr />

      <h2>3. ❤️ Wishlist (Favorites)</h2>
      <p>
        The wishlist is also managed by the <strong>Product Service</strong>.
        You can save the cheapest product from any comparison.
      </p>

      <h3>Available Wishlist Endpoints</h3>
      <ul>
        <li><code>POST /wishlist</code> – Add product to wishlist</li>
        <li><code>GET /wishlist</code> – Get all wishlist items</li>
        <li><code>DELETE /wishlist/:id</code> – Remove item from wishlist</li>
      </ul>

      <hr />

      <h2>4. 💬 Comments</h2>
      <p>
        Comments are handled by the <strong>Comment Service</strong>.
        You can leave feedback directly from the Home page.
      </p>

      <h3>Available Comment Endpoints</h3>
      <ul>
        <li><code>POST /comments</code> – Submit a comment</li>
        <li><code>GET /comments</code> – Retrieve all comments</li>
      </ul>

      <hr />

      <h2>5. 🧭 Navigation</h2>
      <p>The main navigation bar gives you access to:</p>
      <ul>
        <li><strong>Home</strong> – Overview, recommendations, comments</li>
        <li><strong>Products</strong> – Recommended items</li>
        <li><strong>Compare</strong> – Search and compare prices</li>
        <li><strong>Favorites</strong> – Your saved wishlist</li>
        <li><strong>Settings</strong> – Profile and password management</li>
        <li><strong>Profile</strong> – Avatar and personal info</li>
        <li><strong>User Guide</strong> – This page</li>
      </ul>

      <hr />

      <h2>6. 🌍 Microservices Architecture</h2>
      <p>CompraSmart is built using a modern microservices architecture:</p>
      <ul>
        <li><strong>Auth Service</strong> – User accounts & authentication</li>
        <li><strong>Product Service</strong> – Products, comparisons, wishlist</li>
        <li><strong>Comment Service</strong> – User feedback</li>
        <li><strong>Frontend</strong> – React application</li>
      </ul>

      <p>
        Each service is deployed independently on Render and communicates via REST APIs.
      </p>

      <hr />

      <h2>7. 📝 Tips</h2>
      <ul>
        <li>Ensure you are logged in to access protected pages.</li>
        <li>Use the Compare page for the most accurate price insights.</li>
        <li>Allow location access for better map accuracy.</li>
        <li>Use the wishlist to save the cheapest products.</li>
      </ul>

      <p>Enjoy using CompraSmart! 🚀</p>
    </div>
  );
};

export default UserGuide;
