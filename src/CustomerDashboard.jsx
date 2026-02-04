import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
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
  const [loadingBanners,setLoadingBanners] = useState(true);
  const [loadingShops,setLoadingShops] = useState(false);
  const [cartCount,setCartCount] = useState(0);
  const [customer,setCustomer] = useState(null);
  const [showPicker,setShowPicker] = useState(false);

  // 🔥 NEW
  const [editProfile,setEditProfile] = useState(false);
  const [editName,setEditName] = useState("");
  const [editAddress,setEditAddress] = useState("");

  if(!localStorage.getItem("customerLoggedIn")){
    navigate("/customer-login");
  }

  /* ================= LOAD BANNERS ================= */

  useEffect(()=>{
    const load = async ()=>{
      const snap = await getDoc(doc(db,"settings","customerUI"));
      if(snap.exists()){
        setBanners(snap.data().banners || []);
        setCategories(snap.data().categories || {});
      }
      setLoadingBanners(false);
    };
    load();
  },[]);

  /* ================= LOAD CART COUNT ================= */

  useEffect(()=>{
    const loadCart = ()=>{
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.reduce((s,i)=>s+i.qty,0));
    };

    loadCart();
    window.addEventListener("cartUpdated",loadCart);
    return ()=>window.removeEventListener("cartUpdated",loadCart);
  },[]);

  /* ================= AUTO LOAD SAVED LOCATION ================= */

  useEffect(() => {
    const saved = localStorage.getItem("userCoords");
    if(saved){
      const parsed = JSON.parse(saved);
      setCoords(parsed);
      useMyLocation();
    }
  }, []);

  /* ================= BANNER AUTO SLIDE ================= */

  useEffect(()=>{
    if(banners.length===0) return;
    const timer=setInterval(()=>{
      setIndex(i => (i+1)%banners.length);
    },3000);
    return ()=>clearInterval(timer);
  },[banners]);

  /* ================= USE MY LOCATION ================= */

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(

      async (pos) => {

        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        setCoords(newCoords);
        localStorage.setItem("userCoords", JSON.stringify(newCoords));

        setLoadingShops(true);

        const snap = await getDocs(collection(db,"public_shops"));
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setShops(list);
        setLoadingShops(false);
      },

      async () => {

        const fallback = { lat: 13.0827, lng: 80.2707 };

        setCoords(fallback);
        localStorage.setItem("userCoords", JSON.stringify(fallback));

        setLoadingShops(true);

        const snap = await getDocs(collection(db,"public_shops"));
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setShops(list);
        setLoadingShops(false);
      }
    );
  };

  /* ================= PROFILE PHOTO ================= */

  const changePhoto = (e)=>{
    const file = e.target.files[0];
    if(!file || !customer?.id) return;

    const reader = new FileReader();

    reader.onloadend = async ()=>{

      const updated = {
        ...customer,
        photo: reader.result
      };

      setCustomer(updated);
      localStorage.setItem("customer",JSON.stringify(updated));

      await setDoc(
        doc(db,"customers",customer.id),
        { photo: reader.result },
        { merge:true }
      );

      setShowPicker(false);
    };

    reader.readAsDataURL(file);
  };

  /* ================= LOAD CUSTOMER ================= */

  useEffect(()=>{
    const saved = localStorage.getItem("customer");
    if(saved){
      const data = JSON.parse(saved);
      setCustomer(data);
      setEditName(data.name || "");
      setEditAddress(data.address || "");
    }
  },[]);

  /* ================= SAVE PROFILE ================= */

  const saveProfile = async ()=>{

    if(!customer?.id) return;

    const updated = {
      ...customer,
      name: editName,
      address: editAddress
    };

    setCustomer(updated);
    localStorage.setItem("customer",JSON.stringify(updated));

    await setDoc(
      doc(db,"customers",customer.id),
      {
        name: editName,
        address: editAddress
      },
      { merge:true }
    );

    setEditProfile(false);
  };

  /* ================= UI ================= */

  return(

<div className="customer-app">

<div className="top-bar">

  <div style={{display:"flex",alignItems:"center",gap:12}}>

<div
  style={{cursor:"pointer"}}
  onClick={()=>{
    setShowPicker(true);
    setTimeout(()=>{
      document.getElementById("photoPicker")?.click();
    },50);
  }}
>

      <img
        src={
          customer?.photo ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        style={{
          width:45,
          height:45,
          borderRadius:"50%",
          objectFit:"cover"
        }}
      />

</div>

<div>

{!editProfile ? (
<>
<h3 onClick={()=>setEditProfile(true)}>
  {customer?.name || "Customer"} ✏️
</h3>

<small style={{color:"#64748b"}}>
  {customer?.address || ""}
</small>
</>
) : (
<>
<input
  value={editName}
  onChange={e=>setEditName(e.target.value)}
  placeholder="Name"
  style={{padding:6,borderRadius:6}}
/>

<input
  value={editAddress}
  onChange={e=>setEditAddress(e.target.value)}
  placeholder="Address"
  style={{padding:6,borderRadius:6,marginTop:4}}
/>

<button
  style={{marginTop:6}}
  onClick={saveProfile}
>
Save
</button>
</>
)}

</div>

  </div>

  <div className="cart-icon" onClick={()=>navigate("/cart")}>
    🛒
    {cartCount>0 && <span className="cart-badge">{cartCount}</span>}
  </div>

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

<h2 className="section-title">🔥 Special Offers</h2>

<div className="hero-banner">

  <div
    className="slider-track"
    style={{ transform: `translateX(-${index * 100}%)` }}
  >
    {loadingBanners ? (
      <div className="skeleton-banner"></div>
    ) : banners.length ? (
      banners.map((img,i)=>(
        <img key={i} src={img} className="hero-img" loading="lazy"/>
      ))
    ) : (
      <img src="https://via.placeholder.com/600x250" className="hero-img"/>
    )}
  </div>

</div>

<h2 className="section-title">🛒 Shop by Category</h2>

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

<h2 className="section-title">🏪 Nearby Shops</h2>

{coords && (

<div className="shop-listt">

{loadingShops ? (
  <>
    <div className="skeleton-shop"></div>
    <div className="skeleton-shop"></div>
    <div className="skeleton-shop"></div>
  </>
) : (
  shops
   .filter(s =>
     s.name?.toLowerCase().includes(shopSearch.toLowerCase())
   )
   .map(s => (
     <div key={s.id} className="shops-card">

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
        onClick={()=>navigate(`/shop/${s.id}`)}
      >
        View Menu
      </button>

     </div>
   ))
)}

</div>

)}

{showPicker && (
<input
  type="file"
  accept="image/*"
  onChange={changePhoto}
  style={{display:"none"}}
  id="photoPicker"
/>
)}

</div>
);
}
