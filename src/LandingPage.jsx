import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ===== NAVBAR ===== */}
      <nav className="nav">
        <div className="logo">BillPro</div>

        <ul className="menu">
          <li>Features</li>
          <li>Pricing</li>
          <li>Contact</li>
        </ul>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/login">
            <button className="btn-outline">Login</button>
          </Link>

          <Link to="/customer-login">
            <button className="btn-primary">Customer Login</button>
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <div className="hero-text">
        <h1>
          Smart Billing Software
          <span>Built for Businesses</span>
        </h1>

        <Link to="/register">
          <button className="btn-primary">Get Started</button>
        </Link>
      </div>

      {/* ===== FEATURES ===== */}
      <section className="features">
        <h2>Why choose BillPro?</h2>
      </section>

      {/* ===== FOOTER ===== */}
      <footer>
        <p>© 2026 BillPro — Billing made simple.</p>
      </footer>
    </div>
  );
}
