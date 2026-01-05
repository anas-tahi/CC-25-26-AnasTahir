const request = require('supertest');
const express = require('express');
const productRoutes = require('../routes/products');

// ✅ Mock the auth middleware to bypass token check
jest.mock('../middleware/auth', () => (req, res, next) => next());

// ✅ Mock the Product model
jest.mock('../models/Product', () => ({
  find: jest.fn()
}));

const Product = require('../models/Product');

// ✅ Setup Express app with the route
const app = express();
app.use(express.json());
app.use('/products', productRoutes);

test('GET /products/:name returns matching products', async () => {
  Product.find.mockResolvedValue([
    { name: 'Leche', supermarket: 'Mercadona', price: 1.99 },
    { name: 'Leche', supermarket: 'Carrefour', price: 1.49 },
    { name: 'Pan', supermarket: 'Lidl', price: 0.99 }
  ]);

  const res = await request(app).get('/products/Leche');

  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBe(2);
  expect(res.body.every(p => p.name === 'Leche')).toBe(true);
});
