import React, { useState } from "react";
import { db } from "./services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./EmployeeLogin.css";

export default function EmployeeLogin() {
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

      // 🔥 STEP 2: search employees inside each admin
      for (const userDoc of usersSnap.docs) {
        const empRef = collection(db, "users", userDoc.id, "employees");

        const q = query(
          empRef,
          where("userId", "==", userId),
          where("password", "==", password),
      
        );

        const empSnap = await getDocs(q);

      if (!empSnap.empty) {
  const empData = empSnap.docs[0].data(); // ✅ HERE

  loginSuccess = true;
  ownerUid = userDoc.id;

  // 🔥 store employee name
  localStorage.setItem("employeeName", empData.name);

  break;
}

      }

      if (!loginSuccess) {
        return setError("Invalid Employee ID or Password ❌");
      }

      // ✅ LocalStorage session
      localStorage.setItem("employeeLogin", "true");
      localStorage.setItem("employeeId", userId);
      localStorage.setItem("ownerUid", ownerUid);

      localStorage.setItem("employeeLogin", "true");



      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Login failed ❌");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">👨‍💼 Employee Login</h2>

        <div className="login-form">
          <input
            placeholder="Employee ID"
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
