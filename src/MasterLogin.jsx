import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./MasterLogin.css";



export default function MasterLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

const handleLogin = async () => {

  setError("");
  setLoading(true);

  try {

    const result = await signInWithEmailAndPassword(auth, email, password);

    const snap = await getDoc(doc(db, "users", result.user.uid));

    if (!snap.exists() || snap.data().role !== "master") {
      await auth.signOut();
      setError("Not authorized as Master ❌");
      setLoading(false);
      return;
    }

    navigate("/dashboard");

  } catch (err) {
    setError("Invalid email or password");
  }

  setLoading(false);
};


  return (
    <div className="master-auth-wrapper">
      <div className="master-auth-card">
        <h2>👑 Master Login</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          {loading ? "Processing..." : "Login"}
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="switch-link" onClick={() => navigate("/master-register")}>
          New Master? Register →
        </p>
      </div>
    </div>
  );
}
