import React, { useState } from "react";
import { db } from "./services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./StaffLogin.css";

export default function CustomerLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!userId || !password) {
      return setError("Fill all fields ❌");
    }

    try {
      // 🔥 STEP 1: get all admin users
      const usersSnap = await getDocs(collection(db, "users"));

      let loginSuccess = false;
      let ownerUid = "";

      // 🔥 STEP 2: search customers inside each admin
      for (const userDoc of usersSnap.docs) {
        const custRef = collection(
          db,
          "users",
          userDoc.id,
          "customers"
        );

        const q = query(
          custRef,
          where("userId", "==", userId),
          where("password", "==", password),
        );

        const custSnap = await getDocs(q);

if (!custSnap.empty) {
  const custData = custSnap.docs[0].data(); // 🔥 get customer data

  loginSuccess = true;
  ownerUid = userDoc.id;

  // 🔥 store customer name
  localStorage.setItem("customerName", custData.name);

  break;
}

      }

      if (!loginSuccess) {
        return setError("Invalid Customer ID or Password ❌");
      }

      // ✅ LocalStorage session
      localStorage.setItem("customerLogin", "true");
      localStorage.setItem("customerId", userId);
      localStorage.setItem("ownerUid", ownerUid);

      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Login failed ❌");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">🧑 Staff Login</h2>

        <div className="login-form">
          <input
            placeholder="Customer ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>

          {error && <p className="error-text">{error}</p>}

          <Link to="/login">
            <p className="back">← Back</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
