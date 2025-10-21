function findCheapest(products) {
  if (!products || products.length === 0) return null;
  return products.reduce((min, p) => (p.price < min.price ? p : min), products[0]);
}

module.exports = findCheapest;
