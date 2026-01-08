import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { productAPI } from "../services/api";
import { FavoritesContext } from "../context/FavoritesContext";
import { UserContext } from "../context/UserContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import "../styles/ShoppingListCompare.css";

const ShoppingListCompare = () => {
  const { fetchFavoritesCount } = useContext(FavoritesContext);
  const { user, fetchUser } = useContext(UserContext);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [productList, setProductList] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const token = localStorage.getItem("token");
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  // ============================
  // GET USER LOCATION
  // ============================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        () => setShowAddressModal(true)
      );
    } else setShowAddressModal(true);
  }, []);

  // ============================
  // MANUAL ADDRESS
  // ============================
  const handleManualAddressSubmit = async () => {
    setAddressError("");
    if (!manualAddress.trim()) {
      setAddressError("Please enter an address.");
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualAddress
        )}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        setUserLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setShowAddressModal(false);
      } else setAddressError("Address not found.");
    } catch (err) {
      console.error(err);
      setAddressError("Unable to resolve address.");
    }
  };

  // ============================
  // FETCH SUGGESTIONS
  // ============================
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await productAPI.get(`/names/${encodeURIComponent(query)}`);
        const names = res.data.map((p) => p.name);
        setSuggestions(names);
        setHighlightIndex(-1);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [query]);

  // ============================
  // ADD PRODUCT
  // ============================
  const handleAddProduct = async (name) => {
    if (!userLocation) return setShowAddressModal(true);
    if (productList.find((p) => p.product === name)) {
      Swal.fire({ icon: "info", title: "Already added", text: name });
      return;
    }
    try {
      const res = await productAPI.get(`/compare/${encodeURIComponent(name)}`);
      setProductList((prev) => [...prev, res.data]);
      setQuery("");
      setSuggestions([]);
      setHighlightIndex(-1);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Product not found." });
    }
  };

  // ============================
  // REMOVE PRODUCT
  // ============================
  const handleRemoveProduct = (name) => {
    setProductList((prev) => prev.filter((p) => p.product !== name));
  };

  // ============================
  // KEYBOARD NAV
  // ============================
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0) handleAddProduct(suggestions[highlightIndex]);
      else handleAddProduct(query);
    }
  };

  // ============================
  // TOTALS & CHEAPEST
  // ============================
  const totalPrices = {};
  productList.forEach((p) =>
    p.supermarkets.forEach((s) => {
      if (!totalPrices[s.supermarket]) totalPrices[s.supermarket] = 0;
      totalPrices[s.supermarket] += s.price;
    })
  );

  const cheapestSupermarket = Object.keys(totalPrices).reduce((a, b) =>
    totalPrices[a] < totalPrices[b] ? a : b
  , null);

  // ============================
  // ADD CHEAPEST TO WISHLIST
  // ============================
  const handleAddCheapestToWishlist = async () => {
    if (!user) return Swal.fire({ icon: "error", title: "Login required" });

    const cheapestProducts = productList.map((p) => {
      const s = p.supermarkets.find((s) => s.supermarket === cheapestSupermarket);
      return { productId: s.id, name: p.product };
    });

    try {
      await axios.post(
        "https://product-service-3lsh.onrender.com/wishlist",
        { items: cheapestProducts },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({ icon: "success", title: "❤️ Cheapest products saved to your profile!" });
      fetchFavoritesCount();
      fetchUser();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed to save list." });
    }
  };

  // ============================
  // MAP
  // ============================
  useEffect(() => {
    if (!mapRef.current || productList.length === 0 || !userLocation) return;
    setMapLoading(true);

    const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // User location marker
    L.marker([userLocation.lat, userLocation.lng]).addTo(map).bindPopup("You are here").openPopup();

    // Cheapest product store marker (first product only)
    const storeName = productList[0].supermarkets.find(s => s.supermarket === cheapestSupermarket)?.supermarket;
    if (storeName) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(storeName)}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const { lat, lon } = data[0];
            L.marker([parseFloat(lat), parseFloat(lon)], {
              icon: L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
                iconSize: [35, 35],
              }),
            }).addTo(map).bindPopup(`${storeName} ✅ Cheapest store`).openPopup();

            map.fitBounds([
              [userLocation.lat, userLocation.lng],
              [parseFloat(lat), parseFloat(lon)]
            ], { padding: [50,50] });

            setGoogleMapsLink(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lon}`);
          }
          setMapLoading(false);
        })
        .catch(err => { console.error(err); setMapLoading(false); });
    } else setMapLoading(false);

    return () => map.remove();
  }, [productList, userLocation, cheapestSupermarket]);

  // ============================
  // DRAG MODAL
  // ============================
  const startDrag = (e) => {
    setDragging(true);
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
    dragOffset.current = { x: clientX - modalPosition.x, y: clientY - modalPosition.y };
  };
  const onDrag = (e) => {
    if (dragging) {
      const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
      setModalPosition({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y });
    }
  };
  const stopDrag = () => setDragging(false);
  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onDrag);
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onDrag);
      window.removeEventListener("touchend", stopDrag);
    };
  });

  // ============================
  // EXIT
  // ============================
  const exitComparison = () => {
    setProductList([]);
    setGoogleMapsLink("");
    setQuery("");
    setSuggestions([]);
    setHighlightIndex(-1);
  };

  return (
    <div className="compare-container">
      <h2 className="compare-heading">🛒 Shopping List Compare</h2>

      {/* SEARCH */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => handleAddProduct(query)}>Add Product</button>

        {suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className={highlightIndex === i ? "active" : ""}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => handleAddProduct(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PRODUCT LIST */}
      {productList.length > 0 && (
        <div className="result-box">
          <button className="exit-btn" onClick={exitComparison}>× Clear List</button>
          <h3>Shopping List ({productList.length})</h3>

          <div className="result-grid">
            {productList.map((p, i) => (
              <div key={i} className="result-card">
                <div className="result-product">{p.product}</div>
                {p.supermarkets.map((s, idx) => {
                  const isCheapest = s.supermarket === cheapestSupermarket;
                  return (
                    <div key={idx} className={`result-price ${isCheapest ? "best" : ""}`}>
                      {s.supermarket}: {s.price.toFixed(2)} €
                      {isCheapest && <span className="best-badge">✅ Cheapest</span>}
                    </div>
                  );
                })}
                <button onClick={() => handleRemoveProduct(p.product)} className="exit-btn">Remove</button>
              </div>
            ))}
          </div>

          {/* TOTALS */}
          <h4>Total Prices:</h4>
          {Object.keys(totalPrices).map((s, idx) => (
            <div key={idx} className={s === cheapestSupermarket ? "best" : ""}>
              {s}: {totalPrices[s].toFixed(2)} €
            </div>
          ))}

          <button className="wishlist-btn" onClick={handleAddCheapestToWishlist}>
            ❤️ Add Cheapest Products to Profile
          </button>

          {/* MAP */}
          <div className="map-section">
            {mapLoading && <p>Loading map…</p>}
            <div id="map" ref={mapRef}></div>
            {googleMapsLink && (
              <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
                Go to Google Maps 🚀
              </a>
            )}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ left: modalPosition.x, top: modalPosition.y, position: "absolute" }}
            onMouseDown={startDrag} onTouchStart={startDrag}
          >
            <div className="modal-header">
              <span>Enter your address</span>
              <button onClick={() => setShowAddressModal(false)}>×</button>
            </div>
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter your address..."
            />
            {addressError && <p className="error-text">{addressError}</p>}
            <button onClick={handleManualAddressSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
