import React from "react";

const UserGuide = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>📘 CompraSmart User Guide</h1>
      <p>Welcome! This guide will help you use CompraSmart effectively.</p>

      <h2>1. Authentication</h2>
      <ul>
        <li>Register a new user via the **Register** form.</li>
        <li>Log in using your credentials.</li>
        <li>Once logged in, you'll get access to all features.</li>
      </ul>

      <h2>2. Products</h2>
      <ul>
        <li>View all products in the **Products** page.</li>
        <li>Search products by name prefix using `/products/names/:prefix`.</li>
        <li>Compare product prices with `/products/compare/:name` or `/products/compare-all`.</li>
      </ul>

      <h2>3. Comments</h2>
      <ul>
        <li>Add comments on products using the **Comments** section.</li>
        <li>View all comments on `/comments` endpoint.</li>
      </ul>

      <h2>4. Navigation</h2>
      <ul>
        <li>Use the main menu to switch between Auth, Products, and Comments.</li>
        <li>The frontend will automatically communicate with backend services running on ports 4000, 5000, and 6060.</li>
      </ul>

      <h2>5. Tips</h2>
      <ul>
        <li>Make sure all backend services are running before using the app.</li>
        <li>Refresh the page if data doesn’t show immediately after actions.</li>
      </ul>

      <p>Enjoy using CompraSmart! 🚀</p>
    </div>
  );
};

export default UserGuide;
