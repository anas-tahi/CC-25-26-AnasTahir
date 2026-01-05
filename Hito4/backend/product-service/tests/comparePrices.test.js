const getCheapestProduct = require('../utils/comparePrices');

test('returns the cheapest product info', () => {
  const products = [
    { name: 'Leche', supermarket: 'Mercadona', price: 1.25 },
    { name: 'Leche', supermarket: 'Carrefour', price: 1.10 },
    { name: 'Leche', supermarket: 'Dia', price: 1.15 }
  ];

  const result = getCheapestProduct(products, 'Leche');

  expect(result.cheapest.supermarket).toBe('Carrefour');
  expect(result.cheapest.price).toBe(1.10);
  expect(result.supermarkets.length).toBe(3);
});
