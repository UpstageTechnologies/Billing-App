import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

const handleSignup = async () => {
  setError("");

  if (!username.trim()) return setError("Please enter your username");
  if (!password.trim()) return setError("Please enter your password");
  if (password !== confirmPassword) return setError("Passwords do not match ❌");

  try {
    // create account
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // ⭐ use result.user instead of auth.currentUser
    await updateProfile(result.user, {
      displayName: username,
    });

    alert("Account created successfully 🎉 — now you can login");
  } catch (e) {
    setError(e.message);
  }
};


  const handleGoogleSignup = async () => {
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const isNewUser = result._tokenResponse?.isNewUser;

      if (!isNewUser) {
        await auth.signOut();
        alert("This Google account is already registered. Please Login 👍");
        return;
      }

      alert("Google account registered successfully 🎉");
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

      <div className="register-wrapper">
        <center>
          <div className="register-card">
            <h1 style={{ marginBottom: 40 }}>Register</h1>

            <div className="register-form">
              <input
                type="text"
                placeholder="Username"
                autoComplete="off"
                onChange={(e) => setUsername(e.target.value)}
              />

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

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              <button className="register-btn" onClick={handleSignup}>
                Register
              </button>

              <button className="google-btn" onClick={handleGoogleSignup}>
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

              <Link to="/login">
                <p className="back">Already have an account? Login →</p>
              </Link>

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
