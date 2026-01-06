const SHOPPING_API_BASE = process.env.REACT_APP_SHOPPING_API_BASE; // e.g. https://your-user-service
const PRODUCT_API_BASE = process.env.REACT_APP_PRODUCT_API_BASE;   // e.g. https://your-product-service

// Attach auth token if needed
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

export const compareList = async (items) => {
  const res = await fetch(`${PRODUCT_API_BASE}/compare-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: items }), // IMPORTANT
  });

  if (!res.ok) {
    throw new Error("Compare failed");
  }

  return res.json();
};

export const getShoppingList = async (id) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Error loading shopping list");
  }
  return res.json();
};

export const createShoppingList = async ({ name, items }) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, items }),
  });

  if (!res.ok) {
    throw new Error("Error creating shopping list");
  }

  return res.json(); // { id, name, items, createdAt }
};

export const updateShoppingList = async (id, { name, items }) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name, items }),
  });

  if (!res.ok) {
    throw new Error("Error updating shopping list");
  }

  return res.json();
};
export const getShoppingLists = async () => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error loading shopping lists");
  }

  return res.json(); // returns [{ id, name, items }]
};
export const deleteShoppingList = async (id) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error deleting shopping list");
  }

  return res.json();
};

