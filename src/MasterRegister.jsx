import React, { useState } from "react";
import { auth, db } from "./services/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function MasterRegister({ goLogin }) {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    setError("");
    setLoading(true);

    if (!username || !email || !password) {
      setLoading(false);
      return setError("Fill all fields");
    }

    if (password !== confirm) {
      setLoading(false);
      return setError("Passwords do not match");
    }

    try {

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(result.user, {
        displayName: username,
      });

      // ✅ SAVE AS MASTER
         await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: username,
        email: email,
        role: "master",
        plan: "basic",
        createdAt: new Date(),
      });

      // ✅ Redirect to Dashboard after success
      window.location.href = "/dashboard";


    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <>
      <h2 style={{ marginBottom: 25 }}>👑 Master Register</h2>

      <div className="register-form">

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

        {error && (
          <p className="hint" style={{ color: "tomato" }}>
            {error}
          </p>
        )}

        {/* ✅ LOGIN POPUP LINK */}
        <p
          style={{
            marginTop: 15,
            textAlign: "center",
            cursor: "pointer",
            color: "#7c5cff",
            fontWeight: 500
          }}
          onClick={goLogin}
        >
          Already have an account? Login →
        </p>

      </div>
    </>
  );
}
