const API_BASE = "https://product-service-3lsh.onrender.com";

// ============================
// COMPARE LIST
// ============================
export const compareList = async ({ products }) => {
  const res = await fetch(`${API_BASE}/compare-list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ products }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Compare failed");
  }

  return res.json();
};

// ============================
// GET LIST
// ============================
export const getShoppingList = async (id) => {
  const res = await fetch(`${API_BASE}/shopping-lists/${id}`);
  if (!res.ok) throw new Error("Failed to load list");
  return res.json();
};

// ============================
// CREATE LIST
// ============================
export const createShoppingList = async (data) => {
  const res = await fetch(`${API_BASE}/shopping-lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to save list");
  return res.json();
};

// ============================
// UPDATE LIST
// ============================
export const updateShoppingList = async (id, data) => {
  const res = await fetch(`${API_BASE}/shopping-lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update list");
  return res.json();
};
