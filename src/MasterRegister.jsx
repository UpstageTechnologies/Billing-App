import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./services/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./MasterRegister.css";

export default function MasterRegister() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {

    setError("");
    setLoading(true);

    if (!username || !email || !password)
      return setError("Fill all fields");

    if (password !== confirm)
      return setError("Passwords do not match");

    try {

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(result.user, {
        displayName: username,
      });

      // 🔥 Save as MASTER
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: username,
        email: email,
        role: "master",
        plan: "basic",
        createdAt: new Date(),
      });

      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="master-auth-wrapper">
      <div className="master-auth-card">
        <h2>👑 Master Register</h2>

        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

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

        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button onClick={handleRegister}>
          {loading ? "Processing..." : "Register"}
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="switch-link" onClick={() => navigate("/master-login")}>
          Already Master? Login →
        </p>
      </div>
    </div>
  );
}
