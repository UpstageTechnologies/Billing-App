import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Listen for auth state (ensures username loads correctly)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="dash-layout">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="dash-sidebar">
        <h3 className="logo">BillPro</h3>

        <p className="menu-title">MENU</p>

        <button className="menu-btn">🏠 Dashboard</button>
        <button className="menu-btn">📄 Invoices</button>
        <button className="menu-btn">📊 Reports</button>
        <button className="menu-btn">⚙ Settings</button>

        <button className="logout-btn" onClick={handleLogout}>
          🔒 Logout
        </button>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="dash-main">
        {/* TOP BAR */}
        <div className="topbar">
          <h3>📊 Dashboard</h3>

          <div>
            👤 <b>{user?.displayName || user?.email || "User"}</b>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="content-card">
          <h3>👋 Welcome back!</h3>

          <p className="subtitle">
            This is your simple dummy dashboard — ready to expand.
          </p>

          <div className="info-box">
            ⭐ You can add:
            <br />• Sales reports
            <br />• Billing pages
            <br />• Analytics
            <br />• Settings
          </div>

          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
