const compareAllProducts = require('../services/compareAllProducts');

test('returns cheapest product per name', () => {
  const products = [
    { name: 'Leché', supermarket: 'Mercadona', price: 1.99 },
    { name: 'Leche', supermarket: 'Carrefour', price: 1.49 },
    { name: 'Pan', supermarket: 'Lidl', price: 0.99 },
    { name: 'Pan', supermarket: 'Alcampo', price: 1.29 }
  ];

  const result = compareAllProducts(products);

  expect(result).toEqual([
    { name: 'Leche', supermarket: 'Carrefour', price: 1.49 },
    { name: 'Pan', supermarket: 'Lidl', price: 0.99 }
  ]);
});

test('returns empty array for empty input', () => {
  expect(compareAllProducts([])).toEqual([]);
});
