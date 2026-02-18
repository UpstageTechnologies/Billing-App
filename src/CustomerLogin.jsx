import React, { useState } from "react";
import "./CustomerLogin.css";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./services/firebase";

export default function Login({ goRegister, title = "Seller Login" }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ EMAIL LOGIN
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    const snap = await getDoc(doc(db, "customers", user.uid));

    let customerData = {
      id: user.uid,
      email: user.email,
      name: user.displayName || "",
      photo: user.photoURL || ""
    };

    if (snap.exists()) {
      customerData = {
        id: user.uid,
        ...snap.data(),
        photo: user.photoURL || ""
      };
    }

    localStorage.setItem("customerLoggedIn", "true");
    localStorage.setItem("customer", JSON.stringify(customerData));

    window.dispatchEvent(new Event("customerLogin"));

    navigate("/customer-dashboard", { replace: true });

  } catch (error) {
    console.log(error);
    alert("Invalid Email or Password");
  }
};


  //Google Login//

  const handleGoogleLogin = async () => {
  try {
    setLoading(true);

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    const snap = await getDoc(doc(db, "customers", user.uid));

  let customerData = {
  id: user.uid,
  email: user.email,
  name: user.displayName || "",
  photo: user.photoURL || ""   
};

    if (snap.exists()) {
  customerData = {
    id: user.uid,
    ...snap.data(),
    photo: user.photoURL || snap.data().photo || ""
  };
}


    localStorage.setItem("customerLoggedIn", "true");
    localStorage.setItem("customer", JSON.stringify(customerData));

    window.dispatchEvent(new Event("customerLogin"));

    navigate("/customer-dashboard", { replace: true });

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
