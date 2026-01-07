import { PRODUCT_API_BASE, SHOPPING_API_BASE } from "../config";

// ===============================
// GET ALL SHOPPING LISTS
// ===============================
export const getShoppingLists = async () => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error loading shopping lists");
  }

  return res.json(); // [{ id, name, items }]
};

// ===============================
// GET SINGLE LIST
// ===============================
export const getShoppingList = async (id) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error loading shopping list");
  }

  return res.json();
};

// ===============================
// CREATE LIST
// ===============================
export const createShoppingList = async ({ name, items }) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, items }),
  });

  if (!res.ok) {
    throw new Error("Error creating shopping list");
  }

  return res.json(); // { id, name, items }
};

// ===============================
// UPDATE LIST
// ===============================
export const updateShoppingList = async (id, { name, items }) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, items }),
  });

  if (!res.ok) {
    throw new Error("Error updating shopping list");
  }

  return res.json();
};

// ===============================
// DELETE LIST
// ===============================
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

// ===============================
// COMPARE LIST
// ===============================
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
