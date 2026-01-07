import { API_BASE } from "../config";

/* ============================
   GET ALL SHOPPING LISTS
============================ */
export async function getShoppingLists() {
  const res = await fetch(`${API_BASE}/shopping-lists`);

  if (!res.ok) {
    throw new Error("Failed to fetch shopping lists");
  }

  return res.json();
}

/* ============================
   GET ONE SHOPPING LIST
============================ */
export async function getShoppingList(id) {
  const res = await fetch(`${API_BASE}/shopping-lists/${id}`);

  if (!res.ok) {
    throw new Error("Failed to load shopping list");
  }

  return res.json();
}

/* ============================
   CREATE SHOPPING LIST
============================ */
export async function createShoppingList(data) {
  const res = await fetch(`${API_BASE}/shopping-lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create shopping list");
  }

  return res.json();
}

/* ============================
   UPDATE SHOPPING LIST
============================ */
export async function updateShoppingList(id, data) {
  const res = await fetch(`${API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update shopping list");
  }

  return res.json();
}

/* ============================
   COMPARE LIST
============================ */
export async function compareList(payload) {
  const res = await fetch(`${API_BASE}/compare-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Compare failed");
  }

  return res.json();
}
