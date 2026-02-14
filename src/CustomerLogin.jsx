import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";
import "./CustomerLogin.css";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";






export default function CustomerLogin({ goRegister }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    localStorage.setItem("customerLoggedIn", "true");
    localStorage.setItem("customer", JSON.stringify({
      id: user.uid,
      email: user.email
    }));

    alert("Login Success");
    navigate("/customer-dashboard");

  } catch (error) {
    console.log(error);
    alert("Invalid Email or Password");
  }
};


const handleGoogleLogin = async () => {
  try {
    setLoading(true);

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Save customer locally
    localStorage.setItem("customerLoggedIn", "true");
    localStorage.setItem("customer", JSON.stringify({
      id: result.user.uid,
      name: result.user.displayName,
      email: result.user.email,
      photo: result.user.photoURL
    }));

    alert("Google Login Success 🎉");
    window.location.reload();

  } catch (error) {
    console.log(error);
    alert("Google login failed ❌");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="popup-login-card">
      <h2>Customer Login</h2>

      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={e => setPassword(e.target.value)}
        />

        <button className="customer-login-btn">
          Login
        </button>
      </form>

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

      <p className="hint">
        New user?{" "}
        <span
          style={{ cursor: "pointer", color: "#c7d2fe" }}
          onClick={goRegister}
        >
          Register
        </span>
      </p>
    </div>
  );
}
