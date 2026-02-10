import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./services/firebase";
import "./CustomerRegister.css";

export default function CustomerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    mobile: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const docRef = await addDoc(collection(db, "customers"), {
      name: form.name.trim(),
      address: form.address.trim(),
      email: form.email.trim(),
      mobile: String(form.mobile).trim(),
      createdAt: serverTimestamp()
    });

    localStorage.setItem(
      "customer",
      JSON.stringify({ id: docRef.id, ...form })
    );

    alert("Registered successfully");
    navigate("/customer-login");
  };

  return (
    <div className="popup-register-card">
      <h2>Create Account</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          required
          onChange={e =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Address"
          required
          onChange={e =>
            setForm({ ...form, address: e.target.value })
          }
        />

        <input
          placeholder="Email"
          required
          onChange={e =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Mobile"
          required
          onChange={e =>
            setForm({ ...form, mobile: e.target.value })
          }
        />

        <button className="register-btn">
          Register
        </button>
      </form>

      <p className="hint">
        Already registered?{" "}
        <Link to="/customer-login">Login</Link>
      </p>

      <Link className="back" to="/">
        ← Back to Home
      </Link>
    </div>
  );
}
