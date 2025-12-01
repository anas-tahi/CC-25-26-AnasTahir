const normalizeName = require('../utils/normalizeName');
const findCheapest = require('../utils/findCheapest');

function compareAllProducts(products) {
  const grouped = {};

  for (let product of products) {
    const key = normalizeName(product.name);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(product);
  }

  const result = [];

  for (let name in grouped) {
    const cheapest = findCheapest(grouped[name]);
    result.push({
      name: cheapest.name,
      supermarket: cheapest.supermarket,
      price: cheapest.price
    });
  }

  return result;
}

module.exports = compareAllProducts;
