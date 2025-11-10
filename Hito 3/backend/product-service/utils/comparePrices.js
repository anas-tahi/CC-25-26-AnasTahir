function getCheapestProduct(products, name) {
  const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtered = products.filter(p =>
    p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === normalizedName
  );

  if (filtered.length === 0) return null;

  const cheapest = filtered.reduce((min, p) => (p.price < min.price ? p : min), filtered[0]);

  return {
    product: name,
    supermarkets: filtered,
    cheapest: {
      supermarket: cheapest.supermarket,
      price: cheapest.price
    }
  };
}

module.exports = getCheapestProduct;
