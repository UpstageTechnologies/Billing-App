import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "./Invoices.css";

export default function Invoices({ setActivePage }) {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "invoices");

      return onSnapshot(ref, snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setBills(data.reverse()); // latest first
      });
    });

    return () => unsub();
  }, []);

  return (
    <div className="invoice-page">
      <button className="back-btn" onClick={() => setActivePage("home")}>⬅ Back</button>
      <h2>🧾 Invoices</h2>

      {bills.map((b, i) => (
        <div key={b.id} className="invoice-card">
          <div className="invoice-header">
            <div>
              <h3>Invoice #{i + 1}</h3>
              <span>{b.createdAt?.toDate().toLocaleString()}</span>
            </div>
            <div className="invoice-total">₹{b.total}</div>
          </div>

          <div className="invoice-items">
            {b.items.map((it, idx) => (
              <div key={idx} className="invoice-row">
                <span>{it.itemName}</span>
                <span>{it.qty} × ₹{it.price}</span>
                <b>₹{it.qty * it.price}</b>
              </div>
            ))}
          </div>

          <div className="invoice-footer">
            Grand Total : ₹{b.total}
          </div>
        </div>
      ))}
    </div>
  );
}
