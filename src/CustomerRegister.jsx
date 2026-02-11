import React, { useState } from "react";
import { useNavigate,Link} from "react-router-dom";
import "./CustomerRegister.css";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./services/firebase";


export default function CustomerRegister({ goLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    mobile: ""
  });
const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔥 save to Firestore
  const docRef = await addDoc(collection(db, "customers"), {
  name: form.name.trim(),
  address: form.address.trim(),
  email: form.email.trim(),
  mobile: String(form.mobile).trim(), // 🔥 IMPORTANT
  createdAt: serverTimestamp()
});

  // 🔥 keep id locally
  localStorage.setItem(
    "customer",
    JSON.stringify({ id: docRef.id, ...form })
  );

  alert("Registered successfully");
  goLogin();
};


return (
  <div className="popup-login-card">
    <h2>Register</h2>

    <form className="login-form" onSubmit={handleSubmit}>
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
        placeholder="Email"
        required
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Mobile"
        required
        onChange={e => setForm({ ...form, mobile: e.target.value })}
      />

      <button className="customer-login-btn">
        Register
      </button>
    </form>

  <p className="hint">
  Back to{" "}
  <span
    style={{ cursor: "pointer", color: "#c7d2fe" }}
    onClick={goLogin}
  >
    Login
  </span>
</p>


    <span
      className="back"
      style={{ cursor: "pointer" }}
      onClick={() => navigate("/")}
    >
      ← Back to Home
    </span>
  </div>
);

}
