import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { productAPI } from "../services/api";
import { FiSearch } from "react-icons/fi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { FavoritesContext } from "../context/FavoritesContext";
import './pages/styles/shoppingListCompare.css';


const ShoppingListCompare = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [productList, setProductList] = useState([]); // List of added products
  const [matches, setMatches] = useState([]);
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
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const { fetchFavoritesCount } = useContext(FavoritesContext);

  // ============================
  // GET USER LOCATION
  // ============================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => setShowAddressModal(true)
      );
    } else setShowAddressModal(true);
  }, []);

  // ============================
  // MANUAL ADDRESS SUBMIT
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
        setAddressError("");
      } else setAddressError("Address not found. Try again.");
    } catch (err) {
      console.error("Geocode error:", err);
      setAddressError("Unable to resolve address. Try again later.");
    }
  };

  // ============================
  // FETCH SUGGESTIONS
  // ============================
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setMatches([]);
        return;
      }
      try {
        const res = await productAPI.get(`/names/${encodeURIComponent(query)}`);
        const names = (res.data || []).map((p) => p.name);
        setSuggestions(names);
        setHighlightIndex(-1);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [query]);

  // ============================
  // ADD PRODUCT TO LIST
  // ============================
  const handleAddProduct = async (name) => {
    if (!userLocation) {
      setShowAddressModal(true);
      return;
    }
    if (productList.find((p) => p.product === name)) {
      Swal.fire({ icon: "info", title: "Already added", text: name });
      return;
    }

    try {
      const res = await productAPI.get(`/compare/${encodeURIComponent(name)}`);
      setProductList((prev) => [...prev, res.data]);
      setQuery("");
      setSuggestions([]);
      setMatches([]);
      setHighlightIndex(-1);
    } catch (err) {
      console.error("Compare error:", err);
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
  // KEYBOARD NAVIGATION
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
  // TOTAL PRICE CALCULATION
  // ============================
  const totalPrices = {};
  productList.forEach((p) => {
    p.supermarkets.forEach((s) => {
      if (!totalPrices[s.supermarket]) totalPrices[s.supermarket] = 0;
      totalPrices[s.supermarket] += s.price;
    });
  });
  const cheapestSupermarket = Object.keys(totalPrices).reduce((a, b) =>
    totalPrices[a] < totalPrices[b] ? a : b
  );

  // ============================
  // ADD CHEAPEST TO WISHLIST
  // ============================
  const handleAddCheapestToWishlist = () => {
    const cheapestProducts = productList.map((p) => {
      const s = p.supermarkets.find((s) => s.supermarket === cheapestSupermarket);
      return s.id;
    });

    cheapestProducts.forEach(async (id) => {
      try {
        await axios.post(
          "https://product-service-3lsh.onrender.com/wishlist",
          { productId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Wishlist error:", err);
      }
    });
    Swal.fire({ icon: "success", title: "❤️ Cheapest products added to wishlist!" });
    fetchFavoritesCount();
  };

  // ============================
  // MAP LOGIC (first product cheapest store)
  // ============================
  useEffect(() => {
    if (productList.length === 0 || !userLocation || !mapRef.current) return;
    setMapLoading(true);

    const map = L.map(mapRef.current);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const storeName = productList[0].cheapest.supermarket;
    const q = encodeURIComponent(storeName);

    const addStoreMarker = ({ lat, lon }) => {
      const storeLat = parseFloat(lat);
      const storeLon = parseFloat(lon);

      L.marker([storeLat, storeLon], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
          iconSize: [35, 35],
        }),
      })
        .addTo(map)
        .bindPopup(`${storeName} ✅ Cheapest store`)
        .openPopup();

      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
          iconSize: [35, 35],
        }),
      })
        .addTo(map)
        .bindPopup("You are here");

      map.fitBounds(
        [
          [userLocation.lat, userLocation.lng],
          [storeLat, storeLon],
        ],
        { padding: [50, 50] }
      );

      setGoogleMapsLink(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${storeLat},${storeLon}`
      );
      setMapLoading(false);
    };

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) addStoreMarker(data[0]);
        else setMapLoading(false);
      })
      .catch((err) => {
        console.error("Map error:", err);
        setMapLoading(false);
      });

    return () => map.remove();
  }, [productList, userLocation]);

  // ============================
  // DRAG MODAL LOGIC
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
  // EXIT COMPARISON
  // ============================
  const exitComparison = () => {
    setProductList([]);
    setGoogleMapsLink("");
    setQuery("");
    setSuggestions([]);
    setMatches([]);
    setHighlightIndex(-1);
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="compare-container">
      <h2 className="compare-heading">🛒 Shopping List Compare</h2>

      {/* SEARCH BOX */}
      <div className="search-box" ref={dropdownRef}>
        <div className="input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            ref={inputRef}
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
        </div>

        {suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((name, i) => (
              <li
                key={i}
                className={`suggestion ${highlightIndex === i ? "active" : ""}`}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => handleAddProduct(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => handleAddProduct(query)}
          className="compare-button"
        >
          Add Product
        </button>
      </div>

      {/* MATCHES */}
      {matches.length > 0 && (
        <div className="did-you-mean">
          <h4>Did you mean:</h4>
          <div className="did-you-mean-buttons">
            {matches.map((m, idx) => (
              <button
                key={idx}
                onClick={() => handleAddProduct(m)}
                className="did-you-mean-button"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCT LIST */}
      {productList.length > 0 && (
        <div className="result-box">
          <div className="exit-btn-wrapper">
            <button className="exit-btn" onClick={exitComparison}>
              × Clear List
            </button>
          </div>

          <h3>Shopping List ({productList.length} items)</h3>

          <div className="result-grid">
            {productList.map((p, i) => (
              <div key={i} className="result-card">
                <div className="result-product">{p.product}</div>
                <div className="result-supermarket-prices">
                  {p.supermarkets.map((s, idx) => {
                    const isCheapest = s.supermarket === cheapestSupermarket;
                    return (
                      <div key={idx} className="result-price-row">
                        <div className={`result-price ${isCheapest ? "best" : ""}`}>
                          {s.supermarket}: {s.price.toFixed(2)} €
                          {isCheapest && <span className="best-badge">✅ Cheapest</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="exit-btn"
                  onClick={() => handleRemoveProduct(p.product)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <h4>
            Total Prices:
            {Object.keys(totalPrices).map((s, idx) => (
              <div key={idx} className={s === cheapestSupermarket ? "best" : ""}>
                {s}: {totalPrices[s].toFixed(2)} €
              </div>
            ))}
          </h4>

          <button
            className="wishlist-btn"
            onClick={handleAddCheapestToWishlist}
          >
            ❤️ Add Cheapest Products to Wishlist
          </button>

          {/* MAP */}
          <div className="map-section">
            {mapLoading && <p className="map-loading">Loading map…</p>}
            <div id="map" ref={mapRef}></div>
            {googleMapsLink && (
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="google-link"
              >
                Go to Google Maps 🚀
              </a>
            )}
          </div>
        </div>
      )}

      {/* DRAGGABLE MODAL */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div
            ref={modalRef}
            className="modal-content"
            style={{ left: modalPosition.x, top: modalPosition.y, position: "absolute" }}
          >
            <div
              className="modal-header"
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              style={{ cursor: "grab" }}
            >
              <span>Enter your address</span>
              <button
                className="modal-close"
                onClick={() => setShowAddressModal(false)}
              >
                ×
              </button>
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
