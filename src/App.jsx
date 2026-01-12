import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./Landing.css";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Payment from "./pages/Payment";
import EmployeeLogin from "./EmployeeLogin";
import CustomerLogin from "./CustomerLogin";
import ChooseLogin from "./ChooseLogin";
import Scan from "./Scan";
import Sales from "./Sales";



export default function App() {
  return (
    <>
      <Routes>
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

                <div>
                  <Link to="/login">
                    <button className="btn-outline" style={{ marginLeft: 10 }}>
                      Login
                    </button>
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

                <div className="grid">
                  <div className="feature">
                    <h4>⚡ Fast Invoicing</h4>
                    <p>Create GST invoices in seconds.</p>
                  </div>

                  <div className="feature">
                    <h4>📊 Real-time Reports</h4>
                    <p>Track profit & growth.</p>
                  </div>

                  <div className="feature">
                    <h4>🔐 Secure</h4>
                    <p>Cloud backup & access control.</p>
                  </div>

                  <div className="feature">
                    <h4>📱 Mobile Friendly</h4>
                    <p>Work anywhere, anytime.</p>
                  </div>
                </div>
              </section>

              <footer>
                <p>© 2026 BillPro — Billing made simple.</p>
              </footer>
            </div>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />s
        <Route path="/customer-login" element={<CustomerLogin />} />
       <Route path="/chooselogin" element={<ChooseLogin />} />
       <Route path="/scan" element={<Scan />} />
       <Route path="/sales" element={<Sales />}/>



      </Routes>
    </>
  );
}
