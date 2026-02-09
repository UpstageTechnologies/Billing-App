import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";
import "./CustomerLogin.css";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();

  const cleanMobile = String(mobile).trim();
  const cleanName = String(name).trim().toLowerCase();

  console.log("INPUT MOBILE:", cleanMobile);

  const q = query(
    collection(db, "customers"),
    where("mobile", "==", cleanMobile)
  );

  const snap = await getDocs(q);

  console.log("DOC COUNT:", snap.size);

  if (snap.empty) {
    alert("Register first");
    return;
  }

  let matchedCustomer = null;

  snap.forEach(d => {
    const data = d.data();
    if (data.name?.trim().toLowerCase() === cleanName) {
      matchedCustomer = { id: d.id, ...data };
    }
  });

  if (!matchedCustomer) {
    alert("Invalid details");
    return;
  }

  // ✅ Save session
localStorage.setItem(
  "customer",
  JSON.stringify(matchedCustomer)
);
localStorage.setItem("customerLoggedIn", "true");

// 🔥 IMPORTANT: popup login fix
window.location.reload();

};


  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Customer Login</h2>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

         <input
  placeholder="Mobile"
  value={mobile}
  onChange={e => setMobile(e.target.value)}
  required
/>


          <button className="customer-login-btn">
            Login
          </button>
        </form>

        <p className="hint">
          New user? <Link to="/customer-register">Register</Link>
        </p>

        <Link className="back" to="/">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}