// frontend/src/api/shoppingLists.js
import { SHOPPING_API_BASE } from "../config";

// Get all shopping lists
export const getShoppingLists = async () => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`);
  return res.json();
};

// Get one shopping list by ID
export const getShoppingList = async (id) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`);
  return res.json();
};

// Create a new shopping list
export const createShoppingList = async (list) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });
  return res.json();
};

// Update a shopping list by ID
export const updateShoppingList = async (id, list) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });
  return res.json();
};

// Delete a shopping list by ID
export const deleteShoppingList = async (id) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

// Compare a list of items across supermarkets
export const compareList = async (items) => {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-lists/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return res.json();
};
