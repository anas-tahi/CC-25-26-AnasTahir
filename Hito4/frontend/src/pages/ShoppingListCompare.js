import { useState, useEffect, useRef } from "react";
import { productAPI } from "../services/api";
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ShoppingListCompare.css";

/* =============================
   RECOMMENDED LISTS (SPANISH)
============================= */
const recommendedLists = {
  student: [
    {
      name: "Lista Básica Estudiante",
      items: ["Leche", "Pan", "Huevos", "Arroz", "Pasta"],
    },
    {
      name: "Snacks para Estudiantes",
      items: ["Galletas", "Chocolate", "Patatas", "Refrescos"],
    },
  ],
  family: [
    {
      name: "Compra Semanal Familiar",
      items: ["Pollo", "Arroz", "Aceite", "Verduras", "Fruta"],
    },
    {
      name: "Desayuno Familiar",
      items: ["Leche", "Cereales", "Pan", "Mantequilla", "Mermelada"],
    },
  ],
};

const ShoppingListCompare = () => {
  const [selectedList, setSelectedList] = useState(null);
  const [products, setProducts] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const token = localStorage.getItem("token");

  /* =============================
     USER LOCATION
  ============================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(null)
    );
  }, []);

  /* =============================
     LOAD RECOMMENDED LIST
  ============================= */
  const selectRecommendedList = async (list) => {
    setSelectedList(list);
    setProducts([]);
    setShowCompare(false);

    const loadedProducts = [];

    for (const productName of list.items) {
      try {
        const res = await productAPI.get(`/compare/${productName}`);
        loadedProducts.push(res.data);
      } catch {
        console.warn("Producto no encontrado:", productName);
      }
    }

    setProducts(loadedProducts);
  };

  /* =============================
     COMPARE LOGIC (FIXED)
  ============================= */
  const totals = {};
  products.forEach((p) => {
    if (!p.supermarkets) return;
    p.supermarkets.forEach((s) => {
      totals[s.supermarket] =
        (totals[s.supermarket] || 0) + Number(s.price || 0);
    });
  });

  const cheapestMarket =
    Object.keys(totals).length > 0
      ? Object.keys(totals).reduce((a, b) =>
          totals[a] < totals[b] ? a : b
        )
      : null;

  /* =============================
     SAVE LIST TO PROFILE
  ============================= */
  const saveListToProfile = async () => {
    if (!products.length || !cheapestMarket) return;

    const items = products.map((p) => {
      const cheapest = p.supermarkets.find(
        (s) => s.supermarket === cheapestMarket
      );
      return `${p.product} - ${cheapest.supermarket} (€${cheapest.price.toFixed(
        2
      )})`;
    });

    try {
      await axios.post(
        "https://auth-service-a73r.onrender.com/shopping-lists",
        {
          name: selectedList.name,
          items,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Guardado", "Lista añadida a tu perfil ❤️", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar la lista", "error");
    }
  };

  /* =============================
     MAP
  ============================= */
  useEffect(() => {
    if (!showCompare || !mapRef.current || !userLocation) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    mapInstance.current = L.map(mapRef.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapInstance.current
    );
  }, [showCompare, userLocation]);

  /* =============================
     UI
  ============================= */
  return (
    <div className="sl-container">
      <h2>🛒 Listas Recomendadas</h2>

      {!selectedList && (
        <>
          <h3>🧑‍🎓 Listas para Estudiantes</h3>
          <div className="sl-cards">
            {recommendedLists.student.map((list, i) => (
              <div
                key={i}
                className="sl-card"
                onClick={() => selectRecommendedList(list)}
              >
                {list.name}
              </div>
            ))}
          </div>

          <h3>👨‍👩‍👧 Listas para Familias</h3>
          <div className="sl-cards">
            {recommendedLists.family.map((list, i) => (
              <div
                key={i}
                className="sl-card"
                onClick={() => selectRecommendedList(list)}
              >
                {list.name}
              </div>
            ))}
          </div>
        </>
      )}

      {products.length > 0 && (
        <>
          <div className="sl-products">
            {products.map((p, i) => (
              <div key={i} className="sl-item">
                {p.product}
              </div>
            ))}
          </div>

          <button className="compare-btn" onClick={() => setShowCompare(true)}>
            Comparar
          </button>
        </>
      )}

      {showCompare && (
        <div className="sl-results">
          <h3>Resultados</h3>

          {Object.keys(totals).map((market) => (
            <div
              key={market}
              className={`sl-total ${
                market === cheapestMarket ? "best" : ""
              }`}
            >
              {market}: €{totals[market].toFixed(2)}
              {market === cheapestMarket && " ❤️"}
            </div>
          ))}

          <button className="save-btn" onClick={saveListToProfile}>
            Guardar en Perfil
          </button>

          <div ref={mapRef} className="sl-map" />
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
