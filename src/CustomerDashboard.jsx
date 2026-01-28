import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {

  const navigate = useNavigate();

  const [coords, setCoords] = useState(null);
  const [shops, setShops] = useState([]);
  const [shopSearch,setShopSearch] = useState("");

  if (!localStorage.getItem("customerLoggedIn")) {
    navigate("/customer-login");
  }

  const distanceKm = (a, b, c, d) => {
    const R = 6371;
    const dLat = (c - a) * Math.PI / 180;
    const dLon = (d - b) * Math.PI / 180;
    return R * 2 * Math.asin(
      Math.sqrt(
        Math.sin(dLat / 2) ** 2 +
        Math.cos(a * Math.PI / 180) *
        Math.cos(c * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2
      )
    );
  };

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {

        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        setCoords(loc);

        const snap = await getDocs(collection(db, "public_shops"));
        const list = [];

        snap.forEach(d => {
          const s = d.data();

          if (
            s.lat &&
            s.lng &&
            distanceKm(loc.lat, loc.lng, s.lat, s.lng) <= 5
          ) {
            list.push({ id: d.id, ...s });
          }
        });

        setShops(list);
      },
      () => alert("Allow location access")
    );
  };

  return (

<div className="customer-app">

{/* ================= TOP BAR ================= */}
<div className="top-bar">

  <div>
    <h3>👤 Customer</h3>
    <p>{coords ? "Location detected" : "Turn on location"}</p>
  </div>

  <div
  className="profile-btn"
  onClick={()=>{
    document.getElementById("profileMenu").classList.toggle("show");
  }}
></div>

<div id="profileMenu" className="profile-menu">
  <div
    className="menu-item"
    onClick={()=>navigate("/customer-profile")}
  >
    👤 Profile
  </div>

  <div
    className="menu-item logout"
    onClick={()=>{
      localStorage.clear();
      navigate("/");
    }}
  >
    🚪 Logout
  </div>
</div>


</div>

{/* ================= SEARCH ================= */}
<input
  className="search-input"
  placeholder="Search shop..."
  value={shopSearch}
  onChange={e=>setShopSearch(e.target.value)}
/>

{/* ================= LOCATION BTN ================= */}
{!coords && (
  <button className="location-btn" onClick={useMyLocation}>
    📍 Use My Location
  </button>
)}

{/* ================= SHOPS ================= */}
{coords && (

<div className="shop-list">

{shops.length === 0 && (
  <div className="empty">
    <img src="https://i.imgur.com/4M7IWwP.png" />
    <p>No Nearby Shops</p>
  </div>
)}

{shops
.filter(s =>
  s.name.toLowerCase().includes(
    shopSearch.toLowerCase()
  )
)
.map(s => (

<div key={s.id} className="shop-card">

  <img
    src={s.logo || "https://i.imgur.com/8Qf4M0C.png"}
    className="shop-img-top"
  />

  <div className="shop-info">
    <h4>{s.name}</h4>
    <p>{s.address}</p>

<div className="shop-info">
  {s.rating && (
    <div className="rating">⭐ {s.rating}</div>
  )}
</div>
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

</div>
);
}
