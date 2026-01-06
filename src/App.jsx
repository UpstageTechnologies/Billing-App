import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./Landing.css";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

export default function App() {
  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <div className="landing">

              {/* NAV */}
              <nav className="nav">
                <div className="logo">BillPro</div>

                <ul className="menu">
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>Contact</li>
                </ul>

                <div>
                  <Link to="/login">
                    <button className="btn-outline" style={{ marginLeft: 10 }}>
                      Login
                    </button>
                  </Link>
                </div>
              </nav>

              {/* HERO */}
              <div className="hero-text">
                <h1>
                  Smart Billing Software<br />
                  <span>Built for Businesses</span>
                </h1>

                <br /><br /><br /><br /><br /><br /><br />

                <button className="btn-primary">Get Started</button>
              </div>

              <br /><br />

              {/* FEATURES */}
              <section className="features">
                <h2>Why choose BillPro?</h2>

                <div className="grid">
                  <div className="feature">
                    <h4>⚡ Fast Invoicing</h4>
                    <p>Create GST invoices in seconds. Share instantly.</p>
                  </div>

                  <div className="feature">
                    <h4>📊 Real-time Reports</h4>
                    <p>Track payment status, profit & growth trends.</p>
                  </div>

                  <div className="feature">
                    <h4>🔐 Secure & Reliable</h4>
                    <p>Cloud backup & role-based access for teams.</p>
                  </div>

                  <div className="feature">
                    <h4>📱 Mobile Friendly</h4>
                    <p>Manage billing from anywhere, anytime.</p>
                  </div>
                </div>
              </section>

              <footer>
                <p>© 2026 BillPro — Billing made simple.</p>
              </footer>
            </div>
          }
        />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* DASHBOARD (moved inside Routes 👍) */}
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </>
  );
}
  