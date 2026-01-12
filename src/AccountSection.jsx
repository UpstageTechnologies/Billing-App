import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import {  collection,addDoc,onSnapshot,deleteDoc,doc,updateDoc,serverTimestamp,} from "firebase/firestore";
import { query, where, getDocs } from "firebase/firestore";
import "./AccountSection.css";
import { getDoc, setDoc } from "firebase/firestore";
import { runTransaction } from "firebase/firestore";




export default function AccountSection({setActivePage}) {
  const [type, setType] = useState("employee");
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    userId: "",
    password: "",
    phone: "",
  });

  /* ================= LOAD LIST ================= */
  useEffect(() => {
    if (!auth.currentUser) return;

    const ref = collection(
      db,
      "users",
      auth.currentUser.uid,
      type === "employee" ? "employees" : "customers"
    );

    const unsub = onSnapshot(ref, (snap) => {
      setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [type]);

  /* ================= INPUT ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.userId || !form.password || !form.phone) {
      alert("Fill all fields ❌");
      return;
    }

    const colRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      type === "employee" ? "employees" : "customers"
    );
      // 🔥 DUPLICATE ID CHECK (only for CREATE)
// 🔥 GLOBAL DUPLICATE CHECK
const globalRef = doc(db, "global_ids", form.userId);
const globalSnap = await getDoc(globalRef);

if (!editId && globalSnap.exists()) {
  alert("This ID already exists in system ❌");
  return;
}


    if (editId) {
      await updateDoc(doc(colRef, editId), {
        name: form.name,
        userId: form.userId,
        password: form.password,
        phone: form.phone,
      });
      setEditId(null);
    } else {
      await addDoc(colRef, {
        name: form.name,
        userId: form.userId,
        password: form.password,
        phone: form.phone,
        role: type,
        createdAt: serverTimestamp(),
      });
      if (!editId) {
  // ✅ SAVE GLOBAL ID (INSIDE handleSubmit)
  await setDoc(doc(db, "global_ids", form.userId), {
    type, // employee | customer
    ownerUid: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
}

    }

    setForm({ name: "", userId: "", password: "", phone: "" });
    setShowForm(false);
  }
  ;

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setForm({
      name: item.name,
      userId: item.userId,
      password: item.password,
      phone: item.phone,
    });
    setEditId(item.id);
    setShowForm(true);
  };

  /* ================= DELETE ================= */
const handleDelete = async (id) => {
  if (!window.confirm("Delete this record?")) return;

  const item = list.find((i) => i.id === id);
  if (!item) return;

  // 1️⃣ delete employee / customer
  await deleteDoc(
    doc(
      db,
      "users",
      auth.currentUser.uid,
      type === "employee" ? "employees" : "customers",
      id
    )
  );

  // 2️⃣ delete global id
  await deleteDoc(doc(db, "global_ids", item.userId));
};


  return (
    <div className="content-card">
            <button
  onClick={() => setActivePage("home")}
  style={{
    marginBottom: 12,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "white",
    cursor: "pointer",
    marginLeft:30,
    marginTop:20
  }}
>
  ⬅ Back 
</button>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>
          {type === "employee" ? "👨‍💼 Employees" : "🧑‍🤝‍🧑 Customers"}
        </h3>
        <button onClick={() => setShowForm(!showForm)}>➕</button>
      </div>

      {/* DROPDOWN */}
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setShowForm(false);
          setEditId(null);
        }}
      >
        <option value="employee">Employee</option>
        <option value="customer">Customer</option>
      </select>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="userId"
            placeholder="ID"
            value={form.userId}
            onChange={handleChange}
          />

          <input
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <button type="submit">
            {editId ? "Update" : "Create"}
          </button>
        </form>
      )}

      {/* TABLE */}
      <table
        className="account-table"
        style={{
          width: "100%",
          marginTop: 16,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>ID</th>
            <th style={th}>Phone</th>
            <th style={th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {list.map((i) => (
            <tr key={i.id}>
              <td style={td}>{i.name}</td>
              <td style={td}>{i.userId}</td>
              <td style={td}>{i.phone}</td>
              <td style={td}>
                <button onClick={() => handleEdit(i)}>✏️</button>
                <button onClick={() => handleDelete(i.id)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* SIMPLE TABLE STYLE */
const th = {
  border: "1px solid #ddd",
  padding: 8,
  background: "#f3f4f6",
};

const td = {
  border: "1px solid #ddd",
  padding: 8,
};
