import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./CustomerLogin.css";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    localStorage.removeItem("customerLoggedIn");
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const saved = JSON.parse(localStorage.getItem("customer"));

    if (!saved) return alert("Register first");

    if (
      saved.name.toLowerCase() === name.toLowerCase() &&
      saved.mobile === mobile
    ) {
      localStorage.setItem("customerLoggedIn", "true");
      navigate("/customer-dashboard");
    } else {
      alert("Invalid details");
    }
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
          />

          <input
            placeholder="Mobile"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
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
