import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./Dashboard.css";
import AccountSection from "./AccountSection";
import Inventory from "./Inventory";
import Scan from "./Scan";
import Payment from "./pages/Payment";



export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [photo, setPhoto] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [userName, setUserName] = useState("user");
  const [plan, setPlan] = useState("basic");

  const navigate = useNavigate();

  useEffect(() => {
    const emp = localStorage.getItem("employeeLogin");
    const cust = localStorage.getItem("customerLogin");
      // 🔥 EMPLOYEE SESSION
  if (emp) {
    const empName = localStorage.getItem("employeeName");
    setUserName(empName || "Employee");
    setPlan("basic"); // or hide if you want
    setPhoto("");    // or default avatar
    return;
  }
  // 🔥 CUSTOMER SESSION
if (cust) {
  const custName = localStorage.getItem("customerName");
  setUserName(custName || "Customer");
  setPlan("basic");
  setPhoto("");
  return;
}


  // 🔥 CUSTOMER / MASTER LOGIN (Firebase)

    if (emp || cust) return;

    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        navigate("/employee-login");
        return;
      }
      setUser(u);

const userRef = doc(db, "users", u.uid);
const snap = await getDoc(userRef);

// 🔥 Always use Google data if available
const googlePhoto = u.photoURL || "";
const googleName = u.displayName || "";

if (snap.exists()) {
  const data = snap.data();

  // Profile photo priority
  setPhoto(data.photo || googlePhoto || "");

  // Name priority
const finalName = data.name || googleName || u.email || "User";
setUserName(finalName);

 // 🔥 If name missing in Firestore, auto save it
  if (!data.name && finalName) {
    await setDoc(userRef, { name: finalName }, { merge: true });
  }


  setPlan(data.plan || "basic");

} else {
  // 🔥 First time Google login → SAVE in Firestore
  await setDoc(userRef, {
    name: googleName,
    photo: googlePhoto || "",
    plan: "basic",
    isActive: true,
    createdAt: new Date()
  });

  setPhoto(googlePhoto || "");
  setUserName(googleName || "User");
  setPlan("basic");
}


    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    localStorage.clear();
    await auth.signOut().catch(() => {});
    navigate("/login");
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      await setDoc(doc(db, "users", user.uid), { photo: reader.result }, { merge: true });
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="dash-wrapper">

      {/* ===== TOP BAR ===== */}
      <div className="dash-topbar">
        <h2>📊 Dashboard</h2>

      <div className="profile">
        <div className={`plan-badge ${plan}`}>
        {plan === "basic" && " Basic"}
        {plan === "premium" && " Premium"}
        {plan === "lifetime" && "Onetime Acces"}
      </div>
          <label>
            <img
              src={photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
              alt="profile"
              className="profile-img"
            />
            <input type="file" hidden onChange={handleUpload} />
          </label>
          <span>{userName}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {activePage === "home" && (
        <div className="dashboard-grid">

          <div className="dash-card" onClick={() => setActivePage("account")}>
            👤
            <h3>Account Creation</h3>
            <p>Employees & Customers</p>
          </div>

          <div className="dash-card" onClick={() => setActivePage("invoices")}>
            📄
            <h3>Invoices</h3>
            <p>Billing Records</p>
          </div>

          <div className="dash-card" onClick={() => setActivePage("payment")}>
            📈
            <h3>Upgrade To Pro</h3>
            <p>Premiam & onetimepayment</p>
          </div>

          <div className="dash-card" onClick={() => setActivePage("inventory")}>
            📦
            <h3>Inventory</h3>
            <p>Stock Management</p>
          </div>
          <div className="dash-card" onClick={() => setActivePage("scan")}>
  📷
  <h3>Scan</h3>
  <p>Scan barcode</p>
</div>


        </div>
      )}

      {activePage === "account" && <AccountSection />}
      {activePage === "invoices" && <h2 style={{ padding: 20 }}>Invoices Page</h2>}
      {activePage === "reports" && <h2 style={{ padding: 20 }}>Reports Page</h2>}
      {activePage === "inventory" && <Inventory />}
      {activePage === "scan" && <Scan />}
      {activePage === "payment" && <Payment />}


    </div>
  );
}
