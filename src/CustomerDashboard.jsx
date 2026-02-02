import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {

  const navigate = useNavigate();

  const [coords,setCoords] = useState(null);
  const [shops,setShops] = useState([]);
  const [shopSearch,setShopSearch] = useState("");

  const [banners,setBanners] = useState([]);
  const [categories,setCategories] = useState({});
  const [index,setIndex] = useState(0);

  if(!localStorage.getItem("customerLoggedIn")){
    navigate("/customer-login");
  }

  useEffect(()=>{
    const load = async ()=>{
      const snap = await getDoc(doc(db,"settings","customerUI"));
      if(snap.exists()){
        setBanners(snap.data().banners || []);
        setCategories(snap.data().categories || {});
      }
    };
    load();
  },[]);

  useEffect(()=>{
    if(banners.length===0) return;
    const timer=setInterval(()=>{
      setIndex(i => (i+1)%banners.length);
    },3000);
    return ()=>clearInterval(timer);
  },[banners]);

  const useMyLocation=()=>{
    navigator.geolocation.getCurrentPosition(async pos=>{
      setCoords({
        lat:pos.coords.latitude,
        lng:pos.coords.longitude
      });

      const snap=await getDocs(collection(db,"public_shops"));
      const list=[];
      snap.forEach(d=>{
        list.push({id:d.id,...d.data()});
      });
      setShops(list);
    });
  };

  return(

<div className="customer-app">

<div className="top-bar">
  <h3>👤 Customer</h3>
</div>

<input
  className="search-input"
  placeholder="Search shop..."
  value={shopSearch}
  onChange={e=>setShopSearch(e.target.value)}
/>

{!coords &&
<button className="location-btn" onClick={useMyLocation}>
📍 Use My Location
</button>
}

{/* SLIDER */}
<h2 className="section-title">🔥 Special Offers</h2>

<div className="hero-banner">

  <div
    className="slider-track"
    style={{ transform: `translateX(-${index * 100}%)` }}
  >
    {banners.length > 0
      ? banners.map((img, i) => (
          <img key={i} src={img} className="hero-img" />
        ))
      : (
          <img
            src="https://via.placeholder.com/600x250"
            className="hero-img"
          />
        )
    }
  </div>

  {/* SLIDER DOTS */}
  <div className="slider-dots">
    {banners.map((_, i) => (
      <div
        key={i}
        className={i === index ? "slider-dot active" : "slider-dot"}
        onClick={() => setIndex(i)}
      ></div>
    ))}
  </div>

</div>



<h2 className="section-title">🛒 Shop by Category</h2>

{/* CATEGORIES */}
<div className="category-row">

{["Groceries","Snacks","Drinks","Household"].map(n=>(
  <div
    key={n}
    className="category-card"
    onClick={()=>navigate(`/category/${n}`)}
  >
    
    <img src={categories[n] || "https://via.placeholder.com/80"} />
    <span>{n}</span>

  </div>
))}

</div>

{/* SHOPS */}
{coords && (
  <div className="shop-list">

  <h2 className="section-title">🏪 Nearby Shops</h2>

    {shops
      .filter(s =>
        s.name?.toLowerCase().includes(
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
