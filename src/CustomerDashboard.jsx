import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem("customer"));

  const [coords, setCoords] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!localStorage.getItem("customerLoggedIn")) {
    navigate("/customer-login");
  }

  /* 📍 USE MY LOCATION */
  const useMyLocation = () => {
    setError("");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setCoords(c);
        loadNearbyShops(c);
      },
      () => {
        setLoading(false);
        setError("Location permission denied");
      },
      { enableHighAccuracy: true }
    );
  };

  /* 📏 DISTANCE */
  const distanceKm = (a, b, c, d) => {
    const R = 6371;
    const dLat = (c - a) * Math.PI / 180;
    const dLon = (d - b) * Math.PI / 180;
    return R * 2 * Math.asin(Math.sqrt(
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a * Math.PI / 180) *
      Math.cos(c * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2
    ));
  };

  /* 🏪 LOAD SHOPS */
  const loadNearbyShops = async (loc) => {
    const snap = await getDocs(collection(db, "public_shops"));
    const list = [];

    snap.forEach(doc => {
      const s = doc.data();
      if (
        s.lat != null &&
        s.lng != null &&
        distanceKm(loc.lat, loc.lng, s.lat, s.lng) <= 5
      ) {
        list.push({ id: doc.id, ...s });
      }
    });

    setShops(list);
    setLoading(false);
  };

  return (
    <div className="customer-app">

      {/* 🔝 HEADER */}
      <div className="top-bar">
        <div>
          <h3>📍 Your Location</h3>
          <p>{coords ? "Location detected" : "Turn on location"}</p>
        </div>
        <button className="profile-btn">👤</button>
      </div>

      {/* 🔍 SEARCH */}
      <div className="search-box">
        <input placeholder="Search for 'Rice', 'Milk'..." />
        <span>🎤</span>
      </div>

      {/* 📍 CTA */}
      {!coords && (
        <button className="location-btn" onClick={useMyLocation}>
          📍 Use my location
        </button>
      )}

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Finding nearby stores…</p>}

      {/* 🏪 STORES */}
      {coords && (
        <div className="shop-list">
          {shops.length === 0 && (
            <div className="empty">
              <img src="https://i.imgur.com/4M7IWwP.png" alt="no shops" />
              <p>No nearby stores</p>
            </div>
          )}

          {shops.map(s => (
            <div className="shop-card" key={s.id}>
              <div className="shop-info">
                <h4>{s.name}</h4>
                <p>{s.address}</p>
              </div>
              <button className="view-btn">View Menu</button>
            </div>
          ))}
        </div>
      )}

      {/* 🚪 LOGOUT */}
      <button
        className="logout"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}
