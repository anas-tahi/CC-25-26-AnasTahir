// 🌐 Adjust these to your real URLs
const AUTH_API_BASE = process.env.REACT_APP_AUTH_API_BASE || "http://localhost:4000";
const PRODUCT_API_BASE = process.env.REACT_APP_PRODUCT_API_BASE || "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// 🔹 Compare list (product-service)
export async function compareList(items) {
  const res = await fetch(`${PRODUCT_API_BASE}/compare-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: items }),
  });
  if (!res.ok) throw new Error("Error comparing list");
  return res.json();
}

// 🔹 Get all lists (auth-service)
export async function getShoppingLists() {
  const res = await fetch(`${AUTH_API_BASE}/shopping-lists`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error fetching shopping lists");
  return res.json();
}

// 🔹 Get single list
export async function getShoppingList(id) {
  const res = await fetch(`${AUTH_API_BASE}/shopping-lists/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error fetching shopping list");
  return res.json();
}

// 🔹 Create list
export async function createShoppingList({ name, items }) {
  const res = await fetch(`${AUTH_API_BASE}/shopping-lists`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, items }),
  });
  if (!res.ok) throw new Error("Error creating shopping list");
  return res.json();
}

// 🔹 Update list
export async function updateShoppingList(id, { name, items }) {
  const res = await fetch(`${AUTH_API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, items }),
  });
  if (!res.ok) throw new Error("Error updating shopping list");
  return res.json();
}

// 🔹 Delete list
export async function deleteShoppingList(id) {
  const res = await fetch(`${AUTH_API_BASE}/shopping-lists/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error deleting shopping list");
  return res.json();
}
