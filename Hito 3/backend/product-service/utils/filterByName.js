const normalizeName = require('./normalizeName');

function filterByName(products, name) {
  const cleanName = normalizeName(name);
  return products.filter(p => normalizeName(p.name) === cleanName);
}

module.exports = filterByName;
