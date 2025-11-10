// src/components/ProductList.js
import { useState } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [productName, setProductName] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/products/${productName}`);
      setResults(res.data);
      setError('');
    } catch (err) {
      setError('Product not found or server error');
      setResults([]);
    }
  };

  return (
    <div>
      <h2>🔍 Search Product Prices</h2>
      <input
        type="text"
        placeholder="e.g. Leche entera"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />
      <button onClick={fetchProducts}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {results.map((item, index) => (
          <li key={index}>
            🛒 <strong>{item.name}</strong> — {item.supermarket} — 💰 {item.price} €
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
