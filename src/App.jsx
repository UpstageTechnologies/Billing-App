import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./Landing.css";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Payment from "./pages/Payment";
import EmployeeLogin from "./EmployeeLogin";
import StaffLogin from "./StaffLogin";
import ChooseLogin from "./ChooseLogin";
import Scan from "./Scan";
import Sales from "./Sales";
import ShopMenu from "./ShopMenu";
import Checkout from "./Checkout";
import Cart from "./Cart";
import OrderHistory from "./OrderHistory";
import CategoryProducts from "./CategoryProducts";





/* ✅ CUSTOMER IMPORTS (IMPORTANT) */
import CustomerLogin from "./CustomerLogin";
import CustomerRegister from "./CustomerRegister";
import CustomerDashboard from "./CustomerDashboard";

export default function App() {
  return (
    <Routes>

      {/* ===== LANDING PAGE ===== */}
      <Route
        path="/"
        element={
          <div className="landing">
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

            <div className="hero-text">
              <h1>
                Smart Billing Software
                <span>Built for Businesses</span>
              </h1>
              <button className="btn-primary">Get Started</button>
            </div>

            <section className="features">
              <h2>Why choose BillPro?</h2>
            </section>

            <footer>
              <p>© 2026 BillPro — Billing made simple.</p>
            </footer>
          </div>
        }
      />

      {/* ===== AUTH ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ===== DASHBOARD ===== */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/sales" element={<Sales />} />

      {/* ===== STAFF ===== */}
      <Route path="/employee-login" element={<EmployeeLogin />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/chooselogin" element={<ChooseLogin />} />

      {/* ===== CUSTOMER ===== */}
      <Route path="/customer-login" element={<CustomerLogin />} />
      <Route path="/customer-register" element={<CustomerRegister />} />
      <Route path="/customer-dashboard" element={<CustomerDashboard />} />
      <Route path="/shop/:shopId" element={<ShopMenu />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<OrderHistory/>}/>
      <Route path="/category/:name" element={<CategoryProducts/>}/>


 </Routes>
  );
}
