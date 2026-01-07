import { SHOPPING_API_BASE } from "../config";

// Get a single shopping list by ID
export const getShoppingList = async (id) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`);
  if (!res.ok) throw new Error("Failed to fetch shopping list");
  return res.json();
};

// Get all shopping lists
export const getShoppingLists = async () => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`);
  if (!res.ok) throw new Error("Failed to fetch shopping lists");
  return res.json();
};

// Create a new shopping list
export const createShoppingList = async (list) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });
  if (!res.ok) throw new Error("Failed to create shopping list");
  return res.json();
};

// Update an existing shopping list by ID
export const updateShoppingList = async (id, list) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });
  if (!res.ok) throw new Error("Failed to update shopping list");
  return res.json();
};

// Compare a list with supermarkets
export const compareList = async (items) => {
  const res = await fetch(`${SHOPPING_API_BASE}/compare-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: items }),
  });
  if (!res.ok) throw new Error("Failed to compare list");
  return res.json();
};
