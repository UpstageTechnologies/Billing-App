import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { auth } from "./services/firebase";
import { signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,getAdditionalUserInfo,sendPasswordResetEmail, signInWithRedirect, getRedirectResult } from "firebase/auth";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");         // 🌟 SUCCESS MESSAGE
  const [loading, setLoading] = useState(false);      // 🌟 LOADING SPINNER
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      setError("Please enter your email and password ⚠");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      setMessage("Login successful");
      setLoading(false);

      setTimeout(() => navigate("/dashboard"), 800);
    } catch (e) {
      setLoading(false);
      setError("Invalid email or password ❌");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const info = getAdditionalUserInfo(result);

      if (info?.isNewUser) {
        await auth.signOut();
        setLoading(false);
        setError("This Google account is not registered. Please register 👍");
        return;
      }

      setMessage("Login successful");
      setLoading(false);

      setTimeout(() => navigate("/dashboard"), 800);
    } catch (e) {
      setLoading(false);
      setError("Google login failed ❌");
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email first ⚠");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent 📩");
    } catch (e) {
      setError("Could not send reset link ❌");
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
        <div>
         <Link to="/chooselogin">
         <button className="btn-outline" style={{ marginLeft: 10 }}>
               Other Login
         </button>
         </Link>
         </div>
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

              {/* LOGIN BUTTON WITH LOADING */}
              <button
                className="login-btn"
                onClick={handleLogin}
                disabled={loading}
                style={{
                  filter: loading ? "blur(1px)" : "none",
                  position: "relative",
                }}
              >
                {loading ? "Processing..." : "Login"}
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

              {/* ERROR + SUCCESS MESSAGE BELOW BUTTON */}
              {error && (
                <p className="hint" style={{ color: "tomato" }}>
                  {error}
                </p>
              )}

              {message && (
                <p className="hint" style={{ color: "lightgreen" }}>
                  {message}
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