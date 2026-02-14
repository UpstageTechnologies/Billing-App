import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ChooseLogin.css";

export default function ChooseLogin() {
  const navigate = useNavigate();

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 style={{ textAlign: "center", marginBottom: 6 }}>
          Choose Login
        </h2>
        <p className="hint">Select login type</p>

        <div className="login-form" style={{ marginTop: 20 }}>
          <button
            className="login-btn"
            onClick={() => navigate("/employee-login")}
          >
            👨‍💼 Employee Login
          </button>

          <button
            className="login-btn"
            onClick={() => navigate("/staff-login")}
          >
            🧑 Staff Login
          </button>

          <Link to="/">
            <p className="back">← Back to Home</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
