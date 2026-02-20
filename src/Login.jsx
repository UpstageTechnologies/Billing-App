import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { auth } from "./services/firebase";
import { signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,getAdditionalUserInfo,sendPasswordResetEmail, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./services/firebase";


export default function Login({ goRegister,title = "Seller Login",role = "seller"}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");         // 🌟 SUCCESS MESSAGE
  const [loading, setLoading] = useState(false);      // 🌟 LOADING SPINNER
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

const handleLogin = async () => {
  setError("");
  setLoading(true);

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    const snap = await getDoc(doc(db, "users", result.user.uid));

    if (!snap.exists()) {
      await auth.signOut();
      setError("User not registered ❌");
      setLoading(false);
      return;
    }

    const userData = snap.data();

    console.log("Logged role:", userData.role);
    console.log("Required role:", role);

    if (userData.role !== role) {
      await auth.signOut();
      setError("Access denied ❌");
      setLoading(false);
      return;
    }

    navigate("/dashboard");

  } catch (error) {
    setError("Invalid email or password ❌");
  }

  setLoading(false);
};





const handleGoogleLogin = async () => {
  setError("");
  setMessage("");
  setLoading(true);

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const snap = await getDoc(doc(db, "users", result.user.uid));

    if (!snap.exists()) {
      await auth.signOut();
      setLoading(false);
      return setError("Please register first ❌");
    }

    const userData = snap.data();

  if (userData.role !== role) {
      await auth.signOut();
      setLoading(false);
      return setError("Invalid email or password ❌");
    }

    setMessage("Login successful");
    setLoading(false);

    setTimeout(() => navigate("/dashboard"), 500);

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
  <div className="popup-login-card">
<h2 style={{ marginBottom: 25 }}>{title}</h2>

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

      <button
        className="customer-login-btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Processing..." : "Login"}
      </button>

      <button
        className="google-btn"
        onClick={handleGoogleLogin}
        style={{ marginTop: 10 }}
      >
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

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p
          className="hint"
          style={{ cursor: "pointer" }}
          onClick={handleForgotPassword}
        >
          Forgot password?
        </p>

        <p
  className="hint"
  style={{ cursor: "pointer" }}
  onClick={goRegister}
>
  Register →
</p>

      </div>

    <p
  className="back"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/")}
>
  ← Back to Home
</p>


    </div>
  </div>
);

}