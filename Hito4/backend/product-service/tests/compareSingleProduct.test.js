const request = require('supertest');
const express = require('express');
const productRoutes = require('../routes/products');

// ✅ Mock auth middleware
jest.mock('../middleware/auth', () => (req, res, next) => next());

// ✅ Mock Product model
jest.mock('../models/Product', () => ({
  find: jest.fn()
}));

const Product = require('../models/Product');

// ✅ Setup Express app
const app = express();
app.use(express.json());
app.use('/products', productRoutes);

test('GET /products/compare/:name returns cheapest product and all matches', async () => {
  Product.find.mockResolvedValue([
    { name: 'Leche', supermarket: 'Mercadona', price: 1.99 },
    { name: 'Leché', supermarket: 'Carrefour', price: 1.49 },
    { name: 'Pan', supermarket: 'Lidl', price: 0.99 }
  ]);

  const res = await request(app).get('/products/compare/Leche');

  expect(res.statusCode).toBe(200);
  expect(res.body.product.toLowerCase()).toBe('leche');
  expect(res.body.supermarkets.length).toBe(2);
  expect(res.body.cheapest.supermarket).toBe('Carrefour');
  expect(res.body.cheapest.price).toBe(1.49);
});
