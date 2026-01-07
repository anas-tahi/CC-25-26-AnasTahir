import { useState, useEffect, useRef, useContext } from "react";
import { productAPI } from "../services/api";
import { FiSearch } from "react-icons/fi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { FavoritesContext } from "../context/FavoritesContext";
import "../styles/ShoppingListCompare.css";

const ShoppingListCompare = () => {
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

  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const { fetchFavoritesCount } = useContext(FavoritesContext);

  // ============================
  // GET USER LOCATION
  // ============================
  useEffect(() => {
    if (!navigator.geolocation) {
      setShowAddressModal(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setShowAddressModal(true)
    );
  }, []);

  // ============================
  // MANUAL ADDRESS
  // ============================
  const handleManualAddressSubmit = async () => {
    if (!manualAddress.trim()) {
      setAddressError("Please enter an address");
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualAddress
        )}&limit=1`
      );
      const data = await res.json();

      if (!data.length) {
        setAddressError("Address not found");
        return;
      }

      setUserLocation({
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      });
      setShowAddressModal(false);
      setAddressError("");
    } catch {
      setAddressError("Failed to resolve address");
    }
  };

  // ============================
  // FETCH PRODUCT SUGGESTIONS
  // ============================
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await productAPI.get(`/names/${encodeURIComponent(query)}`);
        setSuggestions(res.data.map((p) => p.name));
        setHighlightIndex(-1);
      } catch {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [query]);

  // ============================
  // ADD PRODUCT
  // ============================
  const handleAddProduct = async (name) => {
    if (!userLocation) {
      setShowAddressModal(true);
      return;
    }

    if (productList.some((p) => p.product === name)) {
      Swal.fire("Already added", name, "info");
      return;
    }

    try {
      const res = await productAPI.get(`/compare/${encodeURIComponent(name)}`);
      setProductList((prev) => [...prev, res.data]);
      setQuery("");
      setSuggestions([]);
    } catch {
      Swal.fire("Error", "Product not found", "error");
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
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      handleAddProduct(
        highlightIndex >= 0 ? suggestions[highlightIndex] : query
      );
    }
  };

  // ============================
  // PRICE CALCULATION
  // ============================
  const totals = {};
  productList.forEach((p) =>
    p.supermarkets.forEach((s) => {
      totals[s.supermarket] = (totals[s.supermarket] || 0) + s.price;
    })
  );

  const cheapestStore =
    Object.keys(totals).length > 0
      ? Object.keys(totals).reduce((a, b) =>
          totals[a] < totals[b] ? a : b
        )
      : null;

  // ============================
  // ADD TO WISHLIST
  // ============================
  const handleAddCheapestToWishlist = async () => {
    try {
      for (const p of productList) {
        const cheapest = p.supermarkets.find(
          (s) => s.supermarket === cheapestStore
        );
        await productAPI.post("/wishlist", { productId: cheapest.id });
      }

      Swal.fire("Success", "Added to wishlist ❤️", "success");
      fetchFavoritesCount();
    } catch {
      Swal.fire("Error", "Wishlist failed", "error");
    }
  };

  // ============================
  // MAP
  // ============================
  useEffect(() => {
    if (!productList.length || !userLocation || !mapRef.current) return;

    const map = L.map(mapRef.current);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const storeName = productList[0].cheapest.supermarket;

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        storeName
      )}&limit=1`
    )
      .then((r) => r.json())
      .then((d) => {
        if (!d.length) return;

        const store = [parseFloat(d[0].lat), parseFloat(d[0].lon)];

        L.marker(store).addTo(map).bindPopup("Cheapest Store");
        L.marker([userLocation.lat, userLocation.lng])
          .addTo(map)
          .bindPopup("You");

        map.fitBounds([store, [userLocation.lat, userLocation.lng]]);
        setGoogleMapsLink(
          `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${store[0]},${store[1]}`
        );
      });

    return () => map.remove();
  }, [productList, userLocation]);

  // ============================
  // RENDER
  // ============================
  return (
    <div className="compare-container">
      <h2>🛒 Shopping List Compare</h2>

      <div className="search-box">
        <FiSearch />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
        />
        <button onClick={() => handleAddProduct(query)}>Add</button>

        {suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className={highlightIndex === i ? "active" : ""}
                onClick={() => handleAddProduct(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {productList.length > 0 && (
        <>
          <h3>Products</h3>
          {productList.map((p, i) => (
            <div key={i}>
              <strong>{p.product}</strong>
              <button onClick={() => handleRemoveProduct(p.product)}>
                Remove
              </button>
            </div>
          ))}

          <h4>Total Prices</h4>
          {Object.entries(totals).map(([s, v]) => (
            <div key={s}>
              {s}: {v.toFixed(2)} €
            </div>
          ))}

          <button onClick={handleAddCheapestToWishlist}>
            ❤️ Add Cheapest to Wishlist
          </button>

          <div ref={mapRef} style={{ height: "300px", marginTop: "20px" }} />

          {googleMapsLink && (
            <a href={googleMapsLink} target="_blank" rel="noreferrer">
              Open in Google Maps
            </a>
          )}
        </>
      )}

      {showAddressModal && (
        <div className="modal">
          <input
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Enter address"
          />
          {addressError && <p>{addressError}</p>}
          <button onClick={handleManualAddressSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default ShoppingListCompare;
