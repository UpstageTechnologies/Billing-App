import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ===== NAVBAR ===== */}
      <nav className="nav">
        <div className="logo">BillPro</div>

        {/* RIGHT SIDE GROUP */}
        <div className="nav-right">
          <ul className="menu">
            <li>Features</li>
            <li>Pricing</li>
            <li>Contact</li>
          </ul>

          <div className="nav-buttons">
            <Link to="/login">
              <button className="btn-outline">Login</button>
            </Link>

            <Link to="/customer-login">
              <button className="btn-primary">Customer<br></br>
                Login</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <div className="hero-text">
        <h1>
          Smart Billing Software
          <span>Built for Businesses</span>
        </h1>

        <Link to="/">
          <button className="btn-primary large">Get Started</button>
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
