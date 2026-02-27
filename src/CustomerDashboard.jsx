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
import { Navigate } from "react-router-dom";
import MasterLogin from "./MasterLogin";
import MasterRegister from "./MasterRegister";



export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();


  /* ================= STATE ================= */
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [allShops, setAllShops] = useState([]);
  const [productResults, setProductResults] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
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
  const [shopResults, setShopResults] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

 

const searchProducts = async (query) => {
  if (!query.trim()) {
    setProductResults([]);
    return;
  }

  setLoadingProducts(true);

  const shopSnap = await getDocs(collection(db, "public_shops"));
  let results = [];

  for (const shop of shopSnap.docs) {
    const invSnap = await getDocs(
      collection(db, "users", shop.id, "inventory")
    );

    invSnap.forEach(p => {
      if (
        p.data().itemName
          ?.toLowerCase()
          .includes(query.toLowerCase())
      ) {
        results.push({
          id: p.id,
          ...p.data(),
          shopId: shop.id,
          shopName: shop.data().name
        });
      }
      
    });
  }

  setProductResults(results);
  setLoadingProducts(false);
};

useEffect(() => {
  if (!search.trim()) {
    setShopResults([]);
    return;
  }

  const q = search.toLowerCase();

  const filtered = allShops.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.address?.toLowerCase().includes(q)
  );

  setShopResults(filtered);

}, [search, allShops]);




  /* ================= LOGIN PROTECT ================= */
 
const handleDpChange = async (e) => {
  const file = e.target.files[0];
  if (!file || !customer?.id) return;

  const reader = new FileReader();

  reader.onload = async () => {
    const updated = {
      ...customer,
      photo: reader.result
    };

    setCustomer(updated);
    localStorage.setItem("customer", JSON.stringify(updated));

    // 🔥 SAVE TO FIRESTORE ALSO
    await setDoc(
      doc(db, "customers", customer.id),
      { photo: reader.result },
      { merge: true }
    );
  };

  reader.readAsDataURL(file);
};

const logout = () => {
  localStorage.removeItem("customerLoggedIn");
  localStorage.removeItem("customer");
  localStorage.removeItem("userCoords");

  setCustomer(null);
  setCoords(null);
  setShops([]);
  setIsLoggedIn(false);   // 🔥 VERY IMPORTANT
  setShowAuthMenu(false);

  window.dispatchEvent(new Event("customerLogin")); // 🔥 force refresh

  navigate("/", { replace: true });
};


  /* ================= LOAD CUSTOMER ================= */
useEffect(() => {

  const loadCustomer = async () => {

    const saved = localStorage.getItem("customer");

    if (!saved) return;

    const parsed = JSON.parse(saved);

    if (!parsed?.id) return;

    try {
      // 🔥 ALWAYS FETCH LATEST DATA FROM FIRESTORE
      const snap = await getDoc(doc(db, "customers", parsed.id));

      if (snap.exists()) {

        const freshData = {
          id: parsed.id,
          ...snap.data()
        };

        setCustomer(freshData);
        setEditName(freshData.name || "");
        setEditAddress(freshData.address || "");

        // 🔥 Update localStorage again
        localStorage.setItem("customer", JSON.stringify(freshData));
      }

    } catch (err) {
      console.log("Error loading customer:", err);
    }
  };

  loadCustomer();

  window.addEventListener("customerLogin", loadCustomer);

  return () => {
    window.removeEventListener("customerLogin", loadCustomer);
  };

}, []);



  /* 🔥 FIX: Load shops after customer is ready */
useEffect(() => {
  loadShops();
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
  const parsed = JSON.parse(saved);
  setCoords(parsed);
  // shops will load after customer loads
}
else {
    setShowLocationModal(true);
  }
  
}, []);




  // ✅ STRICT CITY FILTER — ADD HERE
const loadShops = async () => {
  setLoadingShops(true);

  const snap = await getDocs(collection(db, "public_shops"));
  const list = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  setAllShops(list);   // for search
  setShops(list);      // for UI
  setLoadingShops(false);
};
useEffect(() => {

  const checkLogin = () => {
    const saved = localStorage.getItem("customer");

    if (saved) {
      const parsed = JSON.parse(saved);
      setIsLoggedIn(true);
      setCustomer(parsed);
    } else {
      setIsLoggedIn(false);
      setCustomer(null);
    }
  };

  checkLogin();

  window.addEventListener("customerLogin", checkLogin);

  return () => {
    window.removeEventListener("customerLogin", checkLogin);
  };

}, []);

useEffect(() => {
  const handleLoginSuccess = () => {
    console.log("Login Success");

    setAuthMode(null);
  };

  window.addEventListener("customerLogin", handleLoginSuccess);

  return () => {
    window.removeEventListener("customerLogin", handleLoginSuccess);
  };
}, []);


const useMyLocation = () => {

  if (!navigator.geolocation) {
    setLocationError("Geolocation not supported by browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      localStorage.setItem("userCoords", JSON.stringify(coords));
      setCoords(coords);
      setShowLocationModal(false);
      setLocationError("");

      /* 🔥 REVERSE GEOCODING USING OpenStreetMap */
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
        );

        const data = await res.json();

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "";

        if (city) {
          loadShops(city.toLowerCase());
        } else {
          loadShops();
        }

      } catch (err) {
        console.log("Reverse geocoding failed", err);
        loadShops();
      }

    },
    (error) => {

      console.log("Location error:", error);

      if (error.code === 1) {
        setLocationError("Permission denied. Please allow location access.");
      } else if (error.code === 2) {
        setLocationError("Location unavailable.");
      } else if (error.code === 3) {
        setLocationError("Location request timed out.");
      } else {
        setLocationError("Unable to fetch location.");
      }
      localStorage.getItem("customer")
      JSON.parse(localStorage.getItem("customer"))


    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    }
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

const addToCart = (item) => {

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const exist = cart.find(c => c.id === item.id);

  if (exist) {
    exist.qty += 1;
  } else {
    cart.push({
      id: item.id,
      itemName: item.itemName,
      price: Number(item.price),
      image: item.image,
      shopName: item.shopName,
      qty: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
};


  /* ================= UI ================= */
  return (
    <div className="customer-app">

   {/* ================= SEARCH BAR WITH ICONS ================= */}
<div className="search-wrapper">

  {/* LOCATION ICON */}
  <img
    src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
    className="search-location-icon"
    onClick={() => setShowLocationModal(true)}
    alt=""
  />

  {/* SEARCH INPUT */}
  <input
    className="search-input-new"
    placeholder="Search city, shop, category, product..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      searchProducts(e.target.value);
    }}
  />

  {/* 🔽 SEARCH DROPDOWN (INSIDE WRAPPER) 🔽 */}
  {search && (productResults.length > 0 || shopResults.length > 0) && (
    <div className="search-dropdown">

            {/* SHOPS */}
      {shopResults.length > 0 && (
        <>
          <h4 className="search-heading">Shops</h4>

          <div className="shop-horizontal-scroll">
            {shopResults.map(shop => (
              <div
                key={shop.id}
                className="mini-shop-card"
                onClick={() => {
                  navigate(`/shop/${shop.id}`);
                  setSearch("");
                }}
              >
                <img
                  src={shop.logo || "https://via.placeholder.com/80"}
                  className="mini-shop-img"
                  alt=""
                />
                <div className="mini-shop-name">
                  {shop.name}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PRODUCTS */}
      {productResults.length > 0 && (
        <>
          <h4 className="search-heading">Products</h4>

          {productResults.map(product => (
            <div
              key={product.id}
              className="search-item"
              onClick={() => navigate(`/shop/${product.shopId}`)}
            >
              <img
                src={product.image || "https://via.placeholder.com/80"}
                className="search-thumb"
                alt=""
              />

              <div className="search-details">
                <span className="search-title">
                  {product.itemName}
                </span>
                <span className="search-sub">
                  ₹{product.price} • {product.shopName}
                </span>
              </div>

              <button
                className="mini-add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
              >
                Add
              </button>
            </div>
          ))}
        </>
      )}


    </div>
  )}

  {/* RIGHT SECTION */}
{/* RIGHT SECTION */}
<div className="search-right-section">

{/* AUTH ICON (if not logged in) */}
{!isLoggedIn && (
  <div className="auth-wrapper">

    <img
      src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
      className="auth-icon"
      onClick={() => setShowAuthMenu(!showAuthMenu)}
      alt="auth"
    />

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

        <div
          className="dropdown-item"
          onClick={() => {
            setShowAuthMenu(false);
            setAuthMode("master-login");
          }}
        >
          👑 Master Login
        </div>
      </div>
    )}

  </div>
)}

  {/* PROFILE */}
 {isLoggedIn && customer && (
  <div className="profile-wrapper">

    <input
      type="file"
      accept="image/*"
      id="dpUpload"
      style={{ display: "none" }}
      onChange={handleDpChange}
    />

    <img
      src={
        customer.photo && customer.photo !== ""
          ? customer.photo
          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      }
      className="search-profile-icon"
      onClick={() => setShowProfileMenu(!showProfileMenu)}
      alt=""
    />

      {showProfileMenu && (
        <div className="profile-dropdown">

          <div
            className="profile-option"
            onClick={() => {
              setShowUserDetails(!showUserDetails);
            }}
          >
           🙍‍♂️ User
          </div>

          {showUserDetails && (
            <div className="user-details-box">
              <p><strong>Name:</strong> {customer.name}</p>
              <p><strong>Address:</strong> {customer.address}</p>
            </div>
          )}

          <div
            className="profile-option"
            onClick={() => {
              document.getElementById("dpUpload").click();
            }}
          >
            👤  profile
          </div>

          <div
            className="profile-option logout-option"
            onClick={() => {
              setShowLogoutConfirm(true);
              setShowProfileMenu(false);
            }}
          >
            🚪 Logout
          </div>

        </div>
      )}

    </div>
  )}

  {/* CART */}
  <div
    className="search-cart-icon"
    onClick={() => navigate("/cart")}
  >
    🛒
    {cartCount > 0 && (
      <span className="cart-badge-new">{cartCount}</span>
    )}
  </div>

</div>

</div>

{/* LOGOUT CONFIRM MODAL */}
{showLogoutConfirm && (
  <div className="logout-overlay">
    <div className="logout-modal">
      <h3>Are you sure you want to logout?</h3>

      <div className="logout-actions">

        <button
          className="confirm-btn"
          onClick={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
        >
          Yes Logout
        </button>
        
        <button
          className="cancel-btn"
          onClick={() => setShowLogoutConfirm(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{/* ================= AUTH POPUP ================= */}
{authMode && (
  <div 
    className="popup-overlay"
    onClick={() => setAuthMode(null)}   // 🔥 Outside click close
  >
    <div 
      className="popup-container"
      onClick={(e) => e.stopPropagation()}   // 🔥 Inside click close ஆகக்கூடாது
    >

      {authMode === "master-login" && (
        <Login
          title="👑 Master Login"
          role="master"
          goRegister={() => setAuthMode("master-register")}
        />
      )}

      {authMode === "master-register" && (
        <MasterRegister
          goLogin={() => setAuthMode("master-login")}
        />
      )}

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
        <Login
          title="Seller Login"
          role="seller"
          goRegister={() => setAuthMode("seller-register")}
        />
      )}

      {authMode === "seller-register" && (
        <Register
          goLogin={() => setAuthMode("seller-login")}
        />
      )}

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
{isLoggedIn && customer?.address ? (  <>
    <h2 className="section-title">🏪 Nearby Shops</h2>

    {loadingShops ? (
      <div>Loading...</div>
    ) : shops.length === 0 ? (
      <div style={{ padding: 20 }}>No shops found in your city</div>
    ) : (
      <div className="shop-listt">
        {shops.map(s => (
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
        ))}
      </div>
    )}
  </>
) : null}

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