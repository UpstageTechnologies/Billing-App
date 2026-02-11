import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import "./CustomerDashboard.css";
import Login from "./Login";
import CustomerLogin from "./CustomerLogin";
import { useLocation } from "react-router-dom";
import CustomerRegister from "./CustomerRegister";
import Register from "./Register";




export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();


  /* ================= STATE ================= */
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const isLoggedIn = !!localStorage.getItem("customerLoggedIn");
  const [showSellerLogin, setShowSellerLogin] = useState(false);
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [allShops, setAllShops] = useState([]);
  const [productResults, setProductResults] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [shopResults, setShopResults] = useState([]);
  const [authMode, setAuthMode] = useState(null);




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
  const [search, setSearch] = useState("");
  const extractCity = address => {
  if (!address) return "";

  const knownCities = [
    "sattur",
    "sivakasi",
    "virudhunagar",
    "rajapalayam",
    "srivilliputhur"
  ];

  const addr = address.toLowerCase();

  return knownCities.find(city => addr.includes(city)) || "";
};

const searchProducts = async (query) => {
  if (!query.trim()) {
    setProductResults([]);
    setShopResults([]);
    return;
  }

  setLoadingProducts(true);

  const shopSnap = await getDocs(collection(db, "public_shops"));

  let products = [];
  let shops = [];

  for (const shop of shopSnap.docs) {
    const shopData = shop.data();

    // 🔥 SHOP NAME SEARCH
    if (
      shopData.name
        ?.toLowerCase()
        .includes(query.toLowerCase())
    ) {
      shops.push({
        id: shop.id,
        name: shopData.name,
        logo: shopData.logo,
        address: shopData.address
      });
    }

    // 🔥 PRODUCT SEARCH
    const invSnap = await getDocs(
      collection(db, "users", shop.id, "inventory")
    );

    invSnap.forEach(p => {
      if (
        p.data().itemName
          ?.toLowerCase()
          .includes(query.toLowerCase())
      ) {
        products.push({
          id: p.id,
          ...p.data(),
          shopId: shop.id,
          shopName: shopData.name
        });
      }
    });
  }

  setProductResults(products);
  setShopResults(shops);
  setLoadingProducts(false);
};


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
  loadShops();
}, [location.pathname]);


useEffect(() => {
  const saved = localStorage.getItem("userCoords");
  if (!saved) {
    setShowLocationModal(true);
  } else {
    setCoords(JSON.parse(saved));
    loadShops();
  }
}, [customer]);
const handleDpChange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const updated = {
      ...customer,
      photo: reader.result
    };
    setCustomer(updated);
    localStorage.setItem("customer", JSON.stringify(updated));
  };
  reader.readAsDataURL(file);
};
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

const loadShops = async (overrideAddress) => {
  setLoadingShops(true);

  const snap = await getDocs(collection(db, "public_shops"));
  let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // ✅ STRICT CITY FILTER — ADD HERE
const addressToUse = overrideAddress ?? customer?.address;

if (addressToUse) {
  const userCity = extractCity(addressToUse);


  list = list.filter(s => {
    const shopCity = extractCity(s.address);
    return shopCity === userCity;
  });
}
  setAllShops(list);   // 🔥 MASTER LIST
  setShops(list);      // 🔥 DISPLAY LIST
  setLoadingShops(false);
};

// ✅ 🔥 SEARCH FILTER useEffect — ADD IT HERE
useEffect(() => {
  if (!search) {
    setShops(allShops);
    return;
  }

  const q = search.toLowerCase();

  const filtered = allShops.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.address?.toLowerCase().includes(q)
  );

  setShops(filtered);
}, [search, allShops]);


const useMyLocation = () => {
  if (!navigator.geolocation) {
    setLocationError("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const c = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      localStorage.setItem("userCoords", JSON.stringify(c));
      setCoords(c);
      setShowLocationModal(false);
      loadShops();
    },
    err => {
      console.log(err);
      setLocationError(
        "GPS unavailable. Please enter city manually"
      );
    },
    { timeout: 10000 }
  );
};


  /* ================= SAVE PROFILE ================= */
 const saveProfile = async () => {
  if (!customer?.id) return;

  const normalizedAddress = editAddress.trim().toLowerCase();

  const updated = {
    ...customer,
    name: editName,
    address: normalizedAddress
  };

  setCustomer(updated);
  localStorage.setItem("customer", JSON.stringify(updated));

  await setDoc(
    doc(db, "customers", customer.id),
    {
      name: editName,
      address: normalizedAddress
    },
    { merge: true }
  );

  setEditProfile(false);

  // 🔥 FIX: use new address immediately
  loadShops(normalizedAddress);
};


  /* ================= UI ================= */
  return (
    <div className="customer-app">

      {/* ================= TOP BAR ==============  === */}
      <div className="top-bar">

        {/* LEFT */}
       <div> 
       <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        id="dpUpload"
        onChange={handleDpChange}
      />

      <img
        src={customer?.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
        style={{ width: 45, height: 45, borderRadius: "50%", cursor: "pointer" }}
        onClick={() => document.getElementById("dpUpload").click()}
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
        setAuthMode("seller-login");
      }}
    >
      🧑‍💼 Seller Login
    </div>

    <div
      className="dropdown-item"
      onClick={() => {
        setShowAuthMenu(false);
        setAuthMode("customer-login");
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

      {/* ================= AUTH POPUP ================= */}
{authMode && (
  <div className="popup-overlay">
    <div className="popup-box">
      <span
        className="popup-close"
        onClick={() => setAuthMode(null)}
      >
        ✖
      </span>

      {authMode === "customer-login" && (
        <CustomerLogin
          goRegister={() => setAuthMode("customer-register")}
        />
      )}

      {authMode === "customer-register" && (
        <CustomerRegister
          goLogin={() => setAuthMode("customer-login")}
        />
      )}

     {authMode === "seller-login" && (
  <Login goRegister={() => setAuthMode("seller-register")} />
)}

{authMode === "seller-register" && (
  <Register goLogin={() => setAuthMode("seller-login")} />
)}

    </div>
  </div>
)}


{/* ================= PRODUCT SEARCH RESULTS ================= */}
{search && (
  <div className="product-search-results">

    {/* 🔍 SHOPS RESULT */}
    {shopResults.length > 0 && (
      <>
        <h3>Shops</h3>

        {shopResults.map(shop => (
          <div
            key={shop.id}
            className="product-search-card"
            onClick={() => navigate(`/shop/${shop.id}`)}
          >
            <img
              src={shop.logo || "https://via.placeholder.com/80"}
              className="ps-image"
              alt={shop.name}
            />

            <div className="ps-info">
              <h4>{shop.name}</h4>
              <span className="ps-shop">
                {shop.address}
              </span>
            </div>
          </div>
        ))}
      </>
    )}

    {/* 🔍 PRODUCT RESULT */}
    {productResults.length > 0 && (
      <>
        <h3>Products</h3>

        {productResults.map(product => (
          <div key={product.id} className="product-search-card">

            <img
              src={product.image || "https://via.placeholder.com/80"}
              className="ps-image"
              alt={product.itemName}
            />

            <div className="ps-info">
              <h4>{product.itemName}</h4>
              <p className="ps-price">₹{product.price}</p>
              <span className="ps-shop">
                🏪 {product.shopName}
              </span>
            </div>

            <button
              className="ps-add-btn"
              onClick={() => {
                const cart =
                  JSON.parse(localStorage.getItem("cart")) || [];

                const exist = cart.find(
                  i =>
                    i.id === product.id &&
                    i.shopName === product.shopName
                );

                if (exist) {
                  exist.qty += 1;
                } else {
                  cart.push({
                    id: product.id,
                    itemName: product.itemName,
                    price: Number(product.price),
                    image: product.image,
                    shopName: product.shopName,
                    qty: 1
                  });
                }

                localStorage.setItem(
                  "cart",
                  JSON.stringify(cart)
                );
                window.dispatchEvent(
                  new Event("cartUpdated")
                );
              }}
            >
              Add
            </button>
          </div>
        ))}
      </>
    )}

    {/* ❌ NOTHING FOUND */}
    {productResults.length === 0 &&
      shopResults.length === 0 &&
      !loadingProducts && (
        <div className="no-search-results">
          ❌ Products or Shops not found
        </div>
      )}
  </div>
)}

  {/* ================= HERO SLIDER ================= */}

<h2 className="section-title">🔥 Special Offers</h2>

<div className="hero-banner">

  {/* LEFT ARROW */}
  {banners.length > 1 && (
    <button
      className="slider-arrow left"
      onClick={() =>
        setIndex(prev =>
          prev === 0 ? banners.length - 1 : prev - 1
        )
      }
    >
      ‹
    </button>
  )}

  {/* SLIDER TRACK */}
  <div
    className="slider-track"
    style={{ transform: `translateX(-${index * 100}%)` }}
  >
    {loadingBanners ? (
      <div className="skeleton-banner"></div>
    ) : banners.length ? (
      banners.map((img, i) => (
        <img
          key={i}
          src={img}
          className="hero-img"
          alt="banner"
        />
      ))
    ) : (
      <img
        src="https://via.placeholder.com/1200x500"
        className="hero-img"
        alt="placeholder"
      />
    )}
  </div>

  {/* RIGHT ARROW */}
  {banners.length > 1 && (
    <button
      className="slider-arrow right"
      onClick={() =>
        setIndex(prev =>
          prev === banners.length - 1 ? 0 : prev + 1
        )
      }
    >
      ›
    </button>
  )}

  {/* DOTS */}
  {banners.length > 1 && (
    <div className="slider-dots">
      {banners.map((_, i) => (
        <div
          key={i}
          className={`slider-dot ${
            index === i ? "active" : ""
          }`}
          onClick={() => setIndex(i)}
        />
      ))}
    </div>
  )}

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