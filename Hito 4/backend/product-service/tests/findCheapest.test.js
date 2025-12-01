const findCheapest = require('../utils/findCheapest');

test('returns the product with the lowest price', () => {
  const products = [
    { name: 'Leche', supermarket: 'Mercadona', price: 1.99 },
    { name: 'Leche', supermarket: 'Carrefour', price: 1.49 },
    { name: 'Leche', supermarket: 'Lidl', price: 1.79 }
  ];
  const cheapest = findCheapest(products);
  expect(cheapest.supermarket).toBe('Carrefour');
  expect(cheapest.price).toBe(1.49);
});

test('returns null for empty array', () => {
  expect(findCheapest([])).toBeNull();
});
