  import React, { useEffect, useState, useRef } from "react";
  import { auth, db } from "./services/firebase";
  import { useNavigate } from "react-router-dom";
  import { doc, getDoc, setDoc, collection, onSnapshot } from "firebase/firestore";
  import "./Dashboard.css";
  import CreateSeller from "./CreateSeller";


  import AccountSection from "./AccountSection";
  import Inventory from "./Inventory";
  import Scan from "./Scan";
  import Payment from "./pages/Payment";
  import Sales from "./Sales";
  import Invoices from "./Invoices";
  import CustomerUISetup from "./CustomerUISetup";
  import Orders from "./Orders";
  import MasterAnalytics from "./MasterAnalytics"; // ✅ Analytics Import

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
    const [userRole, setUserRole] = useState("seller");


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

      try {
        const snap = await getDoc(doc(db, "users", u.uid));

        if (!snap.exists()) {
          await auth.signOut();
          navigate("/login");
          return;
        }

        const data = snap.data();

        setUser(u);

        // ✅ IMPORTANT FIX HERE
        setUserName(
          data.name?.trim() ||
          u.displayName?.trim() ||
          u.email?.split("@")[0] ||
          "User"
        );

        setPhoto(data.photo || u.photoURL || "");
        setPlan(data.plan || "basic");
        setUserRole(data.role || "seller");

      } catch (err) {
        console.log("User load error:", err);
      }

    });

    return () => unsub();
  }, []);





    /* LOAD SHOP PROFILE */
  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setShopProfile({
          name: data.shopName || "",
          address: data.shopAddress || "",
          logo: data.shopLogo || "",
          phone: data.shopPhone || "",
          gst: data.shopGST || ""
        });
      }
    });

  }, [user]);


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
    try {
      setShowConfirm(false);
      setShowMenu(false);

      // 🔥 Firebase logout
      await auth.signOut();

      // 🔥 Clear storage
      localStorage.clear();

      // 🔥 Reset states
      setUser(null);
      setUserRole(null);
      setPhoto("");
      setActivePage("home");

      // ✅ Navigate to CustomerDashboard (Landing page)
      navigate("/", { replace: true });

    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      await setDoc(
        doc(db, "users", user.uid),
        { photo: reader.result },
        { merge: true }
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

    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    
    <span style={{ fontWeight: 600 }}>
      {userName}
    </span>

    <img
      src={photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
      className="profile-img"
      onClick={()=>setShowMenu(!showMenu)}
    />

  </div>


    {showMenu && (
      <div className="profile-menu">

        <label className="menu-item">
          Profile
          <input type="file" hidden onChange={handleUpload}/>
        </label>

        <div
          className="menu-item"
        onClick={()=>{
    setActivePage("shopProfile");   // 🔥 IMPORTANT
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
  {/* SHOP PROFILE PAGE */}
  {activePage === "shopProfile" && (
    <div className="shop-profile-page">
      <button onClick={() => setActivePage("home")}>⬅ Back</button>

      <h2>🏪 Shop Profile</h2>

      <input
        placeholder="Shop Name"
        value={shopProfile.name}
        onChange={(e) =>
          setShopProfile({ ...shopProfile, name: e.target.value })
        }
      />

      <input
        placeholder="Address"
        value={shopProfile.address}
        onChange={(e) =>
          setShopProfile({ ...shopProfile, address: e.target.value })
        }
      />

      <input
        placeholder="Phone"
        value={shopProfile.phone || ""}
        onChange={(e) =>
          setShopProfile({ ...shopProfile, phone: e.target.value })
        }
      />

      <input
        placeholder="GST Number"
        value={shopProfile.gst || ""}
        onChange={(e) =>
          setShopProfile({ ...shopProfile, gst: e.target.value })
        }
      />
      <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setShopProfile({
          ...shopProfile,
          logo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }}
  />

  {shopProfile.logo && (
    <img
      src={shopProfile.logo}
      style={{ width: 100, marginTop: 10, borderRadius: 8 }}
    />
  )}


      <button
        onClick={async () => {
          await setDoc(
            doc(db, "users", user.uid),
            {
              shopName: shopProfile.name,
              shopAddress: shopProfile.address,
              shopPhone: shopProfile.phone || "",
              shopGST: shopProfile.gst || "",
              shopLogo: shopProfile.logo || ""

            },
            { merge: true }
          );
          alert("Shop Profile Updated ✅");
        }}
      >
        Save
      </button>
    </div>
  )}

  {activePage === "home" && (

    
    <div className="dashboard-grid">

      {/* ================= MASTER VIEW ================= */}
    {userRole === "master" && (
    <>
      <div className="dash-card" onClick={() => setActivePage("createSeller")}>
        👑<h3>Create Shop Owner</h3>
      </div>

      <div className="dash-card" onClick={() => setActivePage("analytics")}>
        📊<h3>Platform Analytics</h3>
      </div>
    </>
  )}

  {userRole === "seller" && (
    <>
      <div className="dash-card" onClick={() => setActivePage("account")}>
        👤<h3>Account Creation</h3>
      </div>

      <div className="dash-card" onClick={() => setActivePage("invoices")}>
        📄<h3>Invoices</h3>
      </div>

      <div className="dash-card" onClick={() => setActivePage("inventory")}>
        📦<h3>Inventory</h3>
      </div>

      <div className="dash-card" onClick={() => setActivePage("scan")}>
        📷<h3>Scan</h3>
      </div>

      <div className="dash-card" onClick={() => setActivePage("sales")}>
        💰<h3>Sales</h3>
      </div>

      <div className="dash-card" onClick={() => setActivePage("orders")}>
        📦<h3>Orders</h3>
      </div>

      <div className="dash-card" onClick={() => setActivePage("customerUI")}>
        🖼️<h3>Customer Dashboard</h3>
      </div>
    </>
  )}


    </div>
  )}

  {activePage === "createSeller" && ( <CreateSeller setActivePage={setActivePage} />)}
  {activePage==="account" && <AccountSection setActivePage={setActivePage}/>}
  {activePage==="inventory" && <Inventory setActivePage={setActivePage}/>}
  {activePage==="scan" && <Scan setActivePage={setActivePage}/>}
  {activePage==="payment" && <Payment setActivePage={setActivePage}/>}
  {activePage==="sales" && <Sales setActivePage={setActivePage}/>}
  {activePage==="invoices" && <Invoices setActivePage={setActivePage}/>}
  {activePage==="orders" && <Orders setActivePage={setActivePage} />}
  {activePage==="customerUI" && <CustomerUISetup setActivePage={setActivePage}/>}
  {activePage==="analytics" && <MasterAnalytics setActivePage={setActivePage}/>}

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

  </div>
  );
  }
