import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerRegister.css";
import { addDoc, collection, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "./services/firebase";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";




export default function CustomerRegister({ goLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    mobile: "",
    password: ""
  });

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      form.email,
      form.password
    );

    const user = userCredential.user;

    await setDoc(doc(db, "customers", user.uid), {
      uid: user.uid,
      name: form.name,
      address: form.address,
      email: form.email,
      mobile: form.mobile,
      createdAt: serverTimestamp()
    });

    localStorage.setItem("customerLoggedIn", "true");
    localStorage.setItem("customer", JSON.stringify({
      id: user.uid,
      name: form.name,
      email: form.email
    }));

    alert("Registered successfully");
    goLogin();

  } catch (error) {
    console.log(error);
    alert(error.message);
  }
};


  const handleGoogleSignup = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Save in Firestore
    await setDoc(doc(db, "customers", result.user.uid), {
      uid: result.user.uid,
      name: result.user.displayName,
      email: result.user.email,
      photo: result.user.photoURL,
      createdAt: new Date()
    });

    // Save in localStorage
    localStorage.setItem("customerLoggedIn", "true");
    localStorage.setItem("customer", JSON.stringify({
      id: result.user.uid,
      name: result.user.displayName,
      email: result.user.email,
      photo: result.user.photoURL
    }));

    alert("Google Signup Success");
    window.location.reload();

  } catch (error) {
    console.log(error);
    alert("Google Signup Failed");
  }
};


  return (
    <div
      className="auth-page"
      onClick={() => goLogin()}
    >
      <div
        className="auth-cardd"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Customer Register</h2>

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Name"
            required
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Address"
            required
            onChange={e => setForm({ ...form, address: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            required
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
          placeholder="Mobile"
          required
          onChange={e => setForm({ ...form, mobile: e.target.value })}
        />


          <input
            type="password"
            placeholder="Password"
            required
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button>
            Register
          </button>
        </form>

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


        {/* 🔥 Required for Firebase */}

        <div
          className="back-text"
          onClick={goLogin}
        >
          Already have account? Login
        </div>
      </div>
    </div>
  );
}
