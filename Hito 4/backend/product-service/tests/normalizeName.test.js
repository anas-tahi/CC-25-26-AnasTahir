const normalizeName = require('../utils/normalizeName');

test('removes accents and lowercases the name', () => {
  expect(normalizeName('Leché')).toBe('leche');
  expect(normalizeName('TOMÁTE')).toBe('tomate');
  expect(normalizeName('Azúcar')).toBe('azucar');
});
