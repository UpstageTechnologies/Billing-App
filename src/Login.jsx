import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ▶ EMAIL / PASSWORD LOGIN
  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password ⚠");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful 🎉");
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  };

  // ▶ GOOGLE LOGIN (redirect to dashboard)
  const handleGoogleLogin = async () => {
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const info = getAdditionalUserInfo(result);

      if (info?.isNewUser) {
        await auth.signOut();
        alert("This Google account is not registered. Please register first 👍");
        return;
      }

      alert("Login successful with Google 🎉");
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  };

  // ▶ RESET PASSWORD
  const handleForgotPassword = async () => {
    setError("");

    if (!email) {
      setError("Please enter your email first to reset password ⚠");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email 📩");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <nav className="nav">
        <div className="logo">BillPro</div>

        <ul className="menu">
          <li>Features</li>
          <li>Pricing</li>
          <li>Contact</li>
        </ul>
      </nav>

      <div className="login-wrapper">
        <center>
          <div className="login-card">
            <h1 style={{ marginBottom: 40 }}>Login</h1>

            <div className="login-form">
              <input
                type="email"
                placeholder="Email address"
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
              />

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 45, width: "100%" }}
                />

                <img
                  src={
                    showPassword
                      ? "https://cdn-icons-png.flaticon.com/512/159/159604.png"
                      : "https://cdn-icons-png.flaticon.com/512/709/709612.png"
                  }
                  alt="toggle password"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                    opacity: 0.9,
                  }}
                />
              </div>

              <button className="login-btn" onClick={handleLogin}>
                Login
              </button>

              {/* GOOGLE LOGIN */}
              <button className="google-btn" onClick={handleGoogleLogin}>
                <div className="google-icon-wrapper">
                  <img
                    className="google-icon"
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="google"
                  />
                </div>
                <span className="google-text">Continue with Google</span>
              </button>

              {error && (
                <p className="hint" style={{ color: "tomato" }}>
                  {error}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  className="hint"
                  style={{ cursor: "pointer" }}
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </p>

                <Link to="/register">
                  <p className="hint" style={{ cursor: "pointer" }}>
                    Register →
                  </p>
                </Link>
              </div>

              <Link to="/">
                <p className="back">← Back to Home</p>
              </Link>
            </div>
          </div>
        </center>
      </div>
    </>
  );
}
