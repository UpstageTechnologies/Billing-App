import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

import { auth } from "./services/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

/* ⭐ FIRESTORE */
import { doc, setDoc } from "firebase/firestore";
import { db } from "./services/firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // ---------------- SIGNUP ----------------
const handleSignup = async () => {
  setError("");
  setMessage("");
  setLoading(true);

  if (!username.trim()) {
    setLoading(false);
    return setError("Please enter your username");
  }

  if (!email.trim()) {
    setLoading(false);
    return setError("Please enter your email");
  }

  if (!password.trim()) {
    setLoading(false);
    return setError("Please enter your password");
  }

  if (password !== confirmPassword) {
    setLoading(false);
    return setError("Passwords do not match ❌");
  }

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // ✅ SET DISPLAY NAME (VERY IMPORTANT)
    await updateProfile(result.user, {
      displayName: username,
    });

    // ✅ SAVE MASTER USER
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      name: username,
      email: result.user.email,
      role: "master",       // ✅ DEFAULT ROLE
      plan: "basic",
      isActive: true,
      createdAt: new Date(),
    });

    setMessage("Account created successfully 🎉");
    setLoading(false);

    // ✅ DIRECT DASHBOARD REDIRECT
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);

  } catch (e) {
    console.error(e);
    setLoading(false);
    setError(e.message || "Could not create account ❌");
  }
};


  // ---------------- GOOGLE SIGNUP ----------------
  const handleGoogleSignup = async () => {
  setError("");
  setMessage("");
  setLoading(true);

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const isNewUser = result._tokenResponse?.isNewUser;

    if (!isNewUser) {
      await auth.signOut();
      setLoading(false);
      return setError("This Google account is already registered. Please Login 👍");
    }

    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      name: result.user.displayName || "User",
      email: result.user.email,
      role: "master",     // ✅ DEFAULT ROLE
      plan: "basic",
      isActive: true,
      createdAt: new Date(),
    });

    setMessage("Google account registered successfully 🎉");
    setLoading(false);

    // ✅ DASHBOARD REDIRECT
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);

  } catch (e) {
    console.error(e);
    setLoading(false);
    setError("Google signup failed ❌");
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
                  alt="toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 18,
                    cursor: "pointer",
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
                  alt="toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 18,
                    cursor: "pointer",
                  }}
                />
              </div>

              <button
                className="register-btn"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? "Processing..." : "Register"}
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

              {message && (
                <p className="hint" style={{ color: "lightgreen" }}>
                  {message}
                </p>
              )}

              <Link to="/login">
                <p className="back">Already have an account? Login →</p>
              </Link>

              <Link to="/">
                <p className="back">← Back to Home </p>
              </Link>
            </div>
          </div>
        </center>
      </div>
    </>
  );
}
