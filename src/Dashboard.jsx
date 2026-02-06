import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./Dashboard.css";
import AccountSection from "./AccountSection";
import Inventory from "./Inventory";
import Scan from "./Scan";
import Payment from "./pages/Payment";
import Sales from "./Sales";
import { collection, onSnapshot } from "firebase/firestore";
import Invoices from "./Invoices";
import CustomerUISetup from "./CustomerUISetup";
import Orders from "./Orders";   // ✅ NEW

export default function Dashboard() {

  const [user, setUser] = useState(null);
  const [photo, setPhoto] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [userName, setUserName] = useState("user");
  const [plan, setPlan] = useState("basic");
  const [todaySales, setTodaySales] = useState(0);

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showShopProfile, setShowShopProfile] = useState(false);

  const [shopProfile, setShopProfile] = useState({
    name:"",
    address:"",
    logo:""
  });

  const navigate = useNavigate();
  const menuRef = useRef();

  /* CLOSE DROPDOWN */
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* TODAY SALES */
  useEffect(() => {
    if (!auth.currentUser) return;
    const ref = collection(db, "users", auth.currentUser.uid, "sales");
    return onSnapshot(ref, snap => {
      let total = 0;
      snap.docs.forEach(d => total += d.data().total || 0);
      setTodaySales(total);
    });
  }, []);

  /* AUTH */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        navigate("/login");
        return;
      }

      setUser(u);

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      const googlePhoto = u.photoURL || "";
      const googleName = u.displayName || "";

      if (snap.exists()) {
        const data = snap.data();
        setPhoto(data.photo || googlePhoto || "");
        setUserName(data.name || googleName || "User");
        setPlan(data.plan || "basic");
      } else {
        await setDoc(userRef,{
          name: googleName,
          photo: googlePhoto || "",
          plan: "basic",
          createdAt: new Date()
        });

        setPhoto(googlePhoto || "");
        setUserName(googleName || "User");
      }
    });

    return () => unsub();
  }, []);

  /* LOAD SHOP PROFILE */
  useEffect(()=>{
    if(!user) return;

    getDoc(
      doc(db,"users",user.uid,"settings","shopProfile")
    ).then(snap=>{
      if(snap.exists()){
        setShopProfile(snap.data());
      }
    });
  },[user]);

  /* SAVE LOCATION */
  useEffect(() => {
    if (!auth.currentUser) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await setDoc(
          doc(db,"users",auth.currentUser.uid,"settings","shopProfile"),
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          },
          { merge:true }
        );
      }
    );
  }, []);

  const confirmLogout = async () => {
    localStorage.clear();
    await auth.signOut();
    navigate("/login");
  };

  /* USER PROFILE IMAGE UPLOAD */
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      await setDoc(
        doc(db,"users",user.uid),
        { photo: reader.result },
        { merge:true }
      );
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
<div className="dash-wrapper">

{/* TOP BAR */}
<div className="dash-topbar">
<h2>📊 Dashboard</h2>

<div className="profile" ref={menuRef}>

  <div
    className={`plan-badge ${plan}`}
    onClick={()=>setActivePage("payment")}
  >
    {plan==="basic" && "Basic"}
    {plan==="premium" && "Premium"}
    {plan==="lifetime" && "Onetime Access"}
  </div>

  <img
    src={photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
    className="profile-img"
    onClick={()=>setShowMenu(!showMenu)}
  />

  {showMenu && (
    <div className="profile-menu">

      <label className="menu-item">
        Profile
        <input type="file" hidden onChange={handleUpload}/>
      </label>

      <div
        className="menu-item"
        onClick={()=>{
          setShowShopProfile(true);
          setShowMenu(false);
        }}
      >
        Shop Profile
      </div>

      <div
        className="menu-item danger"
        onClick={()=>{
          setShowConfirm(true);
          setShowMenu(false);
        }}
      >
        Logout
      </div>

    </div>
  )}

</div>
</div>

{/* HOME */}
{activePage==="home" && (
<div className="dashboard-grid">

<div className="dash-card" onClick={()=>setActivePage("account")}>
👤<h3>Account Creation</h3>
</div>

<div className="dash-card" onClick={()=>setActivePage("invoices")}>
📄<h3>Invoices</h3>
</div>

<div className="dash-card" onClick={()=>setActivePage("inventory")}>
📦<h3>Inventory</h3>
</div>

<div className="dash-card" onClick={()=>setActivePage("scan")}>
📷<h3>Scan</h3>
</div>

<div className="dash-card" onClick={()=>setActivePage("sales")}>
💰<h3>Sales</h3>
<p>₹{todaySales}</p>
</div>

{/* ✅ NEW ORDERS CARD */}
<div className="dash-card" onClick={()=>setActivePage("orders")}>
📦<h3>Orders</h3>
</div>

<div className="dash-card" onClick={()=>setActivePage("customerUI")}>
🖼️<h3>Customer Dashboard</h3>
</div>

</div>
)}

{activePage==="account" && <AccountSection setActivePage={setActivePage}/>}
{activePage==="inventory" && <Inventory setActivePage={setActivePage}/>}
{activePage==="scan" && <Scan setActivePage={setActivePage}/>}
{activePage==="payment" && <Payment setActivePage={setActivePage}/>}
{activePage==="sales" && <Sales setActivePage={setActivePage}/>}
{activePage==="invoices" && <Invoices setActivePage={setActivePage}/>}
{activePage==="orders" && <Orders />}   {/* ✅ NEW */}
{activePage==="customerUI" && <CustomerUISetup setActivePage={setActivePage}/>}

{/* LOGOUT CONFIRM */}
{showConfirm && (
<div className="confirm-overlay">
<div className="confirm-box">

<h3>Are you sure?</h3>
<p>You want to logout?</p>

<div className="confirm-actions">
<button onClick={()=>setShowConfirm(false)}>Cancel</button>
<button className="danger" onClick={confirmLogout}>Logout</button>
</div>

</div>
</div>
)}

{/* SHOP PROFILE POPUP */}
{showShopProfile && (
<div className="confirm-overlay">
<div className="confirm-box">

<h3>Shop Profile</h3>

<input
placeholder="Shop Name"
value={shopProfile.name}
onChange={e=>setShopProfile({...shopProfile,name:e.target.value})}
/>

<input
placeholder="Shop Address"
value={shopProfile.address}
onChange={e=>setShopProfile({...shopProfile,address:e.target.value})}
/>

<input
type="file"
accept="image/*"
onChange={(e)=>{
const file=e.target.files[0];
if(!file) return;
const reader=new FileReader();
reader.onloadend=()=>setShopProfile(
{...shopProfile,logo:reader.result}
);
reader.readAsDataURL(file);
}}
/>

<div className="confirm-actions">

<button onClick={()=>setShowShopProfile(false)}>
Cancel
</button>

<button
className="danger"
onClick={async()=>{
await setDoc(
  doc(db,"users",auth.currentUser.uid,"settings","shopProfile"),
  shopProfile,
  { merge:true }
);

await setDoc(
  doc(db,"public_shops",auth.currentUser.uid),
  {
    name: shopProfile.name,
    address: shopProfile.address,
    logo: shopProfile.logo
  },
  { merge:true }
);

setShowShopProfile(false);
alert("Shop Profile Saved ✅");
}}
>
Save
</button>

</div>

</div>
</div>
)}

</div>
);
}
