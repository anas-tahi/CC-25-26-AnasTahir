const filterByName = require('../utils/filterByName');
const normalizeName = require('../utils/normalizeName');

test('filters products by normalized name', () => {
  const products = [
    { name: 'Leché', supermarket: 'Mercadona', price: 1.99 },
    { name: 'Leche', supermarket: 'Carrefour', price: 1.49 },
    { name: 'Pan', supermarket: 'Lidl', price: 0.99 }
  ];
  const filtered = filterByName(products, 'LECHE');
  expect(filtered.length).toBe(2);
  expect(filtered.every(p => normalizeName(p.name) === 'leche')).toBe(true);
});

test('returns empty array if no match', () => {
  const products = [
    { name: 'Pan', supermarket: 'Lidl', price: 0.99 }
  ];
  const filtered = filterByName(products, 'Azúcar');
  expect(filtered).toEqual([]);
});
