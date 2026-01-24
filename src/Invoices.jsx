import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "./Invoices.css";

export default function Invoices({ setActivePage }) {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const ref = collection(db, "users", auth.currentUser.uid, "sales");

    return onSnapshot(ref, snap => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div className="invoice-page">
      <button className="back-btn" onClick={() => setActivePage("home")}>⬅ Back</button>

      <h2>🧾 Invoices</h2>

      {invoices.map(inv => (
        <div className="invoice-card" key={inv.id} onClick={() => setSelected(inv)}>
          <div className="invoice-header">
            <h3>Invoice #{inv.id.slice(0, 5)}</h3>
            <span>{inv.createdAt?.toDate?.().toLocaleDateString()}</span>
          </div>

          {/* 👤 CUSTOMER NAME IN CARD */}
          {inv.customerName && (
            <div style={{ fontSize: "12px", marginTop: "6px", color: "#475569" }}>
              👤 {inv.customerName}
            </div>
          )}

          <div className="invoice-items">
            {inv.items?.map((i, idx) => (
              <div className="invoice-row" key={idx}>
                <span>{i.itemName}</span>
                <span>{i.qty}</span>
                <span>₹{i.price}</span>
              </div>
            ))}
          </div>

          <div className="invoice-total">₹{inv.total}</div>
        </div>
      ))}

      {/* 🔥 RECEIPT POPUP */}
      {selected && (
        <div className="invoice-overlay">
          <div className="invoice-box" id="invoice-print">

            <h2>BILLPRO</h2>

            <div className="invoice-meta">
              <span>Invoice: {selected.id.slice(0, 6)}</span>
              <span>{selected.createdAt?.toDate?.().toLocaleString()}</span>
            </div>

            {/* 👤 CUSTOMER DETAILS IN RECEIPT */}
            {(selected.customerName || selected.customerAddress) && (
              <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                {selected.customerName && <div>Name : {selected.customerName}</div>}
                {selected.customerAddress && <div>Address : {selected.customerAddress}</div>}
                <hr style={{ margin: "6px 0" }} />
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>₹</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.itemName}</td>
                    <td>{i.qty}</td>
                    <td>{i.price}</td>
                    <td>{i.qty * i.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-total">
              Grand Total : ₹{selected.total}
            </div>

            <div className="invoice-buttons">
              <button className="print" onClick={() => window.print()}>🖨 Print</button>
              <button className="close" onClick={() => setSelected(null)}>Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
