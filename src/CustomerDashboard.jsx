import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import "./CustomerDashboard.css";
import Login from "./Login";
import CustomerLogin from "./CustomerLogin";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const isLoggedIn = !!localStorage.getItem("customerLoggedIn");
  const [showSellerLogin, setShowSellerLogin] = useState(false);
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);

  const [coords, setCoords] = useState(null);
  const [shops, setShops] = useState([]);

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState({});
  const [index, setIndex] = useState(0);

  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingShops, setLoadingShops] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [customer, setCustomer] = useState(null);

  const [editProfile, setEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState("");

  /* ================= LOGIN PROTECT ================= */
  useEffect(() => {
    if (
      !localStorage.getItem("customerLoggedIn") &&
      window.location.pathname === "/customer-dashboard"
    ) {
      navigate("/customer-login", { replace: true });
    }
  }, [navigate]);

useEffect(() => {
  const saved = localStorage.getItem("userCoords");
  if (!saved) {
    setShowLocationModal(true);
  } else {
    setCoords(JSON.parse(saved));
    loadShops();
  }
}, [customer]);





  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customer");
    localStorage.removeItem("userCoords");

    setCustomer(null);
    setCoords(null);
    setShops([]);
    setShowAuthMenu(false);

    navigate("/", { replace: true });
  };

  /* ================= LOAD CUSTOMER ================= */
  useEffect(() => {
    const saved = localStorage.getItem("customer");
    if (saved) {
      const data = JSON.parse(saved);
      setCustomer(data);
      setEditName(data.name || "");
      setEditAddress(data.address || "");
    }
  }, []);

  /* ================= LOAD UI ================= */
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "settings", "customerUI"));
      if (snap.exists()) {
        setBanners(snap.data().banners || []);
        setCategories(snap.data().categories || {});
      }
      setLoadingBanners(false);
    };
    load();
  }, []);

  /* ================= SLIDER ================= */
  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(() => {
      setIndex(i => (i + 1) % banners.length);
    }, 3000);
    return () => clearInterval(t);
  }, [banners]);

  /* ================= CART ================= */
  useEffect(() => {
    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
    };
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  /* ================= LOCATION ================= */
  useEffect(() => {
    const saved = localStorage.getItem("userCoords");
    if (saved) {
      setCoords(JSON.parse(saved));
      loadShops();
    }
  }, [customer]);

  const loadShops = async () => {
    setLoadingShops(true);
    const snap = await getDocs(collection(db, "public_shops"));
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (customer?.address) {
      list = list.filter(s =>
        s.address?.toLowerCase().includes(customer.address.toLowerCase())
      );
    }

    setShops(list);
    setLoadingShops(false);
  };

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        localStorage.setItem("userCoords", JSON.stringify(c));
        setCoords(c);
        setShowLocationModal(false);
        loadShops();
      },
      () => setLocationError("Enable location access")
    );
  };

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    if (!customer?.id) return;

    const updated = { ...customer, name: editName, address: editAddress };
    setCustomer(updated);
    localStorage.setItem("customer", JSON.stringify(updated));

    await setDoc(
      doc(db, "customers", customer.id),
      { name: editName, address: editAddress },
      { merge: true }
    );

    setEditProfile(false);
    loadShops();
  };

  /* ================= UI ================= */
  return (
    <div className="customer-app">

      {/* ================= TOP BAR ================= */}
      <div className="top-bar">

        {/* LEFT */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img
            src={customer?.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            style={{ width: 45, height: 45, borderRadius: "50%" }}
          />

          <div>
            {!editProfile ? (
              <>
                <h3 onClick={() => setEditProfile(true)}>
                  {customer?.name || "Customer"} ✏️
                </h3>
                <small>{customer?.address || ""}</small>
              </>
            ) : (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} />
                <input value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                <button onClick={saveProfile}>Save</button>
              </>
            )}

            <span
              style={{ cursor: "pointer", fontSize: 18 }}
              onClick={() => setShowLocationModal(true)}
            >
              📍
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>

          {/* 🔐 SIGN IN / LOGOUT */}
          <div className="auth-wrapper">
            {!isLoggedIn ? (
              <>
                <button
                  className="signin-btn"
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                >
                  Sign In ⬇
                </button>

                {showAuthMenu && (
                  <div className="auth-dropdown">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setShowAuthMenu(false);
                        setShowSellerLogin(true);
                      }}
                    >
                      🧑‍💼 Seller Login
                    </div>

                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setShowAuthMenu(false);
                        setShowCustomerLogin(true);
                      }}
                    >
                      🛒 Customer Login
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            )}
          </div>

          {/* 🛒 CART */}
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>

        </div>
      </div>

      {/* ================= SELLER LOGIN POPUP ================= */}
      {showSellerLogin && (
        <div className="popup-overlay">
          <div className="popup-box">
            <span
              className="popup-close"
              onClick={() => setShowSellerLogin(false)}
            >
              ✖
            </span>
            <Login />
          </div>
        </div>
      )}

      {/* ================= CUSTOMER LOGIN POPUP ================= */}
      {showCustomerLogin && (
        <div className="popup-overlay">
          <div className="popup-box">
            <span
              className="popup-close"
              onClick={() => setShowCustomerLogin(false)}
            >
              ✖
            </span>
            <CustomerLogin />
          </div>
        </div>
      )}

      {/* ================= BANNERS ================= */}
      <h2 className="section-title">🔥 Special Offers</h2>
      <div className="hero-banner">
        <div
          className="slider-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {loadingBanners ? (
            <div className="skeleton-banner" />
          ) : (
            banners.map((img, i) => (
              <img key={i} src={img} className="hero-img" />
            ))
          )}
        </div>
      </div>

      {/* ================= CATEGORIES ================= */}
      <h2 className="section-title">🛒 Shop by Category</h2>
      <div className="category-row">
        {["Groceries", "Snacks", "Drinks", "Household"].map(n => (
          <div
            key={n}
            className="category-card"
            onClick={() => navigate(`/category/${n}`)}
          >
            <img src={categories[n] || "https://via.placeholder.com/80"} />
            <span>{n}</span>
          </div>
        ))}
      </div>

  {/* ================= SHOPS ================= */}
      {shops.length > 0 && (
  <>
    <h2 className="section-title">🏪 Nearby Shops</h2>
    <div className="shop-listt">
      {loadingShops ? (
        <div>Loading...</div>
      ) : (
        shops.map(s => (
          <div key={s.id} className="shops-card">
            <img src={s.logo} className="shop-img-top" />
            <div className="shop-info">
              <h4>{s.name}</h4>
              <p>{s.address}</p>
            </div>
            <button
              className="view-btn"
              onClick={() => navigate(`/shop/${s.id}`)}
            >
              View Menu
            </button>
          </div>
        ))
      )}
    </div>
  </>
)}


      {/* ================= LOCATION MODAL ================= */}
      {showLocationModal && (
        <div className="location-overlay">
          <div className="location-modal">
            <span
              className="close-btn"
              onClick={() => setShowLocationModal(false)}
            >
              ✖
            </span>
            <div className="gps-btn" onClick={useMyLocation}>
              📍 Get current location
              <small>Using GPS</small>
            </div>
            {locationError && (
              <div className="location-error">{locationError}</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}