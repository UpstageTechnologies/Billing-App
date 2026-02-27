import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { collection, onSnapshot, doc, getDoc, query, orderBy } from "firebase/firestore";
import "./Invoices.css";
import "./Sales.css"; 
export default function Invoices({ setActivePage }) {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [shopName, setShopName] = useState("");
  const [shopLogo, setShopLogo] = useState("");

useEffect(() => {

  const unsubscribeAuth = auth.onAuthStateChanged(user => {
    if (!user) return;

  const ref = query(
    collection(db, "users", user.uid, "invoices"),
    orderBy("createdAt", "desc")
  );
    const unsubscribeSnap = onSnapshot(ref, snap => {
      setInvoices(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    // cleanup snapshot when auth changes
    return () => unsubscribeSnap();
  });

  return () => unsubscribeAuth();

}, []);

  useEffect(() => {
  const loadShop = async () => {
    if (!auth.currentUser) return;

    const ref = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setShopName(data.shopName || "");
      setShopLogo(data.shopLogo || "");
    }
  };

  loadShop();
}, []);

  return (

    <div>
          <button className="back-btn" onClick={() => setActivePage("home")}>⬅ Back</button>

    <div className="invoice-page">


      <h2>🧾 Invoices</h2>

      {invoices.map(inv => (
        <div className="invoice-card" key={inv.id} onClick={() => setSelected(inv)}>
          <div className="invoice-header">
            <h3>Invoice #{inv.id.slice(0, 5)}</h3>
            <span>
              {inv.createdAt
                ? new Date(inv.createdAt.seconds * 1000).toLocaleString("en-IN")
                : "Loading..."}
            </span>          </div>

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

      <div className="invoice-header-section">
        {shopLogo && (
          <img src={shopLogo} className="invoice-shop-logo" />
        )}
        <h2>{shopName}</h2>
      </div>

      <div className="invoice-meta">
        <span>Invoice: {selected.id.slice(0, 6)}</span>
        <span>
          {selected.createdAt
            ? new Date(selected.createdAt.seconds * 1000).toLocaleString()
            : ""}
        </span>      </div>

   <div className="bill-header">
  <span>Item</span>
  <span>Qty</span>
  <span>Price</span>
  <span>GST%</span>
  <span>Total</span>
</div>

{selected.items.map((i, idx) => (
  <div key={idx} className="bill-item">
    <span>{i.itemName}</span>
    <span className="col-qty">{i.qty}</span>
    <span className="col-price">₹{i.price}</span>
    <span className="col-gst">{i.gst || 0}%</span>
    <b className="col-total">
      ₹{(i.price * i.qty) + (i.price * i.qty * ((i.gst || 0) / 100))}
    </b>
  </div>
))}
    

    <div className="total">
      Subtotal ₹{selected.total}
    </div>

      <div className="invoice-buttons">
        <button className="print" onClick={() => window.print()}>🖨 Print</button>
        <button className="close" onClick={() => setSelected(null)}>Close</button>
      </div>

    </div>
  </div>
)}
    
    </div>
 
 </div>
  );
}
