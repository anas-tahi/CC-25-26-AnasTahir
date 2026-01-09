import axios from "axios";

export const shoppingListAPI = axios.create({
  baseURL: "https://auth-service-a73r.onrender.com", // removed /auth
});

export const getShoppingLists = async () => {
  const token = localStorage.getItem("token");
  const res = await shoppingListAPI.get("/shopping-lists", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteShoppingList = async (id) => {
  const token = localStorage.getItem("token");
  const res = await shoppingListAPI.delete(`/shopping-lists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
