import { SHOPPING_API_BASE } from "../config";

// GET a shopping list by ID
export async function getShoppingList(listId) {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-list/${listId}`);
  if (!res.ok) throw new Error("Failed to fetch shopping list");
  return res.json();
}

// CREATE a new shopping list
export async function createShoppingList(data) {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create shopping list");
  return res.json();
}

// UPDATE an existing shopping list
export async function updateShoppingList(listId, data) {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-list/${listId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update shopping list");
  return res.json();
}

// DELETE a shopping list
export async function deleteShoppingList(listId) {
  const res = await fetch(`${SHOPPING_API_BASE}/shopping-list/${listId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete shopping list");
  return res.json();
}

// COMPARE a list
export async function compareList(items) {
  const res = await fetch(`${SHOPPING_API_BASE}/compare-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: items }),
  });
  if (!res.ok) throw new Error("Failed to compare list");
  return res.json();
}
