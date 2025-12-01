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

test('GET /products/compare-all returns cheapest products for each name', async () => {
  // ✅ Add a third unique product 'Queso' to match test expectation
  Product.find.mockResolvedValue([
    { name: 'Leche', supermarket: 'Mercadona', price: 1.99 },
    { name: 'Leché', supermarket: 'Carrefour', price: 1.49 },
    { name: 'Pan', supermarket: 'Lidl', price: 0.99 },
    { name: 'Pan', supermarket: 'Alcampo', price: 1.29 },
    { name: 'Queso', supermarket: 'Carrefour', price: 2.49 } // NEW
  ]);

  const res = await request(app).get('/products/compare-all');

  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBe(3); // leche, pan, queso

  const leche = res.body.find(p => p.product.toLowerCase() === 'leche');
  expect(leche.cheapest.supermarket).toBe('Carrefour');
  expect(leche.cheapest.price).toBe(1.49);

  const pan = res.body.find(p => p.product.toLowerCase() === 'pan');
  expect(pan.cheapest.supermarket).toBe('Lidl');
  expect(pan.cheapest.price).toBe(0.99);

  const queso = res.body.find(p => p.product.toLowerCase() === 'queso');
  expect(queso.cheapest.supermarket).toBe('Carrefour');
  expect(queso.cheapest.price).toBe(2.49);
});
