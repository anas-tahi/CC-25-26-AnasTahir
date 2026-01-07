// frontend/src/api/shoppingLists.js

import { SHOPPING_API_BASE } from "../config";

// Get a single shopping list by ID
export async function getShoppingList(id) {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`);
  if (!res.ok) throw new Error("Failed to fetch shopping list");
  return res.json();
}

// Get all shopping lists
export async function getShoppingLists() {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`);
  if (!res.ok) throw new Error("Failed to fetch shopping lists");
  return res.json();
}

// Create a new shopping list
export async function createShoppingList(data) {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create shopping list");
  return res.json();
}

// Update an existing shopping list by ID
export async function updateShoppingList(id, data) {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update shopping list");
  return res.json();
}

// Delete a shopping list by ID
export async function deleteShoppingList(id) {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete shopping list");
  return res.json();
}

// Compare a shopping list (send items to compare prices)
export async function compareList(items) {
  const res = await fetch(`${SHOPPING_API_BASE}/compare-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: items }),
  });
  if (!res.ok) throw new Error("Failed to compare list");
  return res.json();
}

// Export everything
export {
  getShoppingList,
  getShoppingLists,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  compareList,
};
