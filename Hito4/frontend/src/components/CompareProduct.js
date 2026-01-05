// src/components/CompareProduct.js
import { useState } from 'react';
import axios from 'axios';
import { productAPI } from '../services/api';

const CompareProduct = () => {
  const [productName, setProductName] = useState('');
  const [cheapest, setCheapest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const fetchComparison = async () => {
    try {
      const res = await productAPI.get(`/compare/${encodeURIComponent(productName)}`);
        setCheapest(res.data.cheapest);
        setMatches(res.data.matches || []);
      setError('');
    } catch (err) {
      setError('Product not found or server error');
      setCheapest(null);
      setMatches([]);
    }
  };

  return (
    <div>
      <h2>💰 Compare Product Prices</h2>
      <input
        type="text"
        placeholder="e.g. Leche entera"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />
      <button onClick={fetchComparison}>Compare</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {cheapest && (
        <div>
          <h3>✅ Cheapest Option</h3>
          <p>
            🛒 <strong>{cheapest.name}</strong> — {cheapest.supermarket} — 💰 {cheapest.price} €
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <h3>📋 All Matches</h3>
          <ul>
            {matches.map((item, index) => (
              <li key={index}>
                🛒 {item.supermarket} — 💰 {item.price} €
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompareProduct;
