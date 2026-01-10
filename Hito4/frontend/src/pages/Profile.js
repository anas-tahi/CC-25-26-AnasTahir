import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../pages/Profile.css";

const Profile = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  /* =======================
     FETCH SHOPPING LISTS
  ======================= */
  const fetchLists = async () => {
    try {
      const res = await axios.get(
        "https://auth-service-a73r.onrender.com/shopping-lists",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLists(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error loading your shopping lists.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  /* =======================
     DELETE LIST
  ======================= */
  const deleteList = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete list?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `https://auth-service-a73r.onrender.com/shopping-lists/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Deleted", "Shopping list deleted.", "success");
      fetchLists();
    } catch {
      Swal.fire("Error", "Could not delete list.", "error");
    }
  };

  /* =======================
     LOAD LIST
  ======================= */
  const loadList = (list) => {
    localStorage.setItem("loadedShoppingList", JSON.stringify(list));
    Swal.fire(
      "Loaded",
      "Shopping list loaded. Go to Shopping List Compare.",
      "success"
    );
  };

  /* =======================
     UI
  ======================= */
  if (loading) {
    return <p className="profile-loading">Loading...</p>;
  }

  return (
    <div className="profile-container">
      <h2>👤 My Profile</h2>

      <section className="profile-lists">
        <h3>🛒 My Shopping Lists</h3>

        {lists.length === 0 ? (
          <p>No shopping lists yet.</p>
        ) : (
          lists.map((list) => (
            <div key={list._id} className="profile-list-card">
              <h4>{list.name || "Unnamed List"}</h4>

              <p>
                Items: <strong>{list.items?.length || 0}</strong>
              </p>

              <p className="profile-date">
                Created:{" "}
                {list.createdAt
                  ? new Date(list.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>

              <div className="profile-actions">
                <button onClick={() => loadList(list)}>
                  Load in Shopping List
                </button>

                <button
                  className="danger"
                  onClick={() => deleteList(list._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Profile;
