import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./services/firebase";
import "./Seller.css";
import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword
} from "firebase/auth";

export default function Seller({ setActivePage }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createSeller = async () => {
    try {
      const masterUser = auth.currentUser; // Save master login

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        role: "seller",
        plan: "basic",
        createdAt: new Date()
      });

      // Logout newly created seller
      await signOut(auth);

      // Login master again
      await signInWithEmailAndPassword(
        auth,
        masterUser.email,
        prompt("Enter master password again:")
      );

      alert("Shop Owner Created ✅");
      setActivePage("home");

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="cs-wrapper">
      <div className="cs-card">

        <button 
          className="cs-back"
          onClick={() => setActivePage("home")}
        >
          ← Back
        </button>

        <h2 className="cs-title">Create Shop Owner</h2>

        <input
          className="cs-input"
          placeholder="Shop Owner Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="cs-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="cs-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="cs-btn" onClick={createSeller}>
          Create Seller
        </button>

      </div>
    </div>
  );
}