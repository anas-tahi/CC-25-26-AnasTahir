import { SHOPPING_API_BASE, PRODUCT_API_BASE } from "../config";

// ==========================
// SHOPPING LIST API
// ==========================

// Get a single shopping list by ID
export const getShoppingList = async (id) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`);
  if (!res.ok) throw new Error("Failed to fetch shopping list");
  const data = await res.json();
  return data;
};

// Create a new shopping list
export const createShoppingList = async (list) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });

  if (!res.ok) throw new Error("Failed to create shopping list");
  const data = await res.json();
  return data;
};

// Update an existing shopping list
export const updateShoppingList = async (id, list) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });

  if (!res.ok) throw new Error("Failed to update shopping list");
  const data = await res.json();
  return data;
};

// Compare a shopping list across supermarkets
export const compareList = async (items) => {
  const res = await fetch(`${PRODUCT_API_BASE}/compare-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: items }),
  });

  if (!res.ok) throw new Error("Failed to compare list");
  const data = await res.json();
  return data;
};
