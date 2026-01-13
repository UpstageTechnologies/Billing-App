import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import Scan from "./Scan";
import "./Sales.css";
import InvoiceView from "./InvoiceView";

export default function Sales({ setActivePage }) {
  const [inventory, setInventory] = useState([]);
  const [bill, setBill] = useState([]);
  const [todayBills, setTodayBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  // 🔥 Inventory
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "inventory");

      return onSnapshot(ref, snap => {
        setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    });

    return () => unsub();
  }, []);

  // 🔥 Today Sales
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "sales");

      return onSnapshot(ref, snap => {
        const bills = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        setTodayBills(bills);
      });
    });

    return () => unsub();
  }, []);

  // 🔥 Add to Bill
  const addToBill = async (item) => {
    if (item.quantity <= 0) {
      alert("Out of stock");
      return;
    }

    setBill(prevBill => {
      const exist = prevBill.find(i => i.barcode === item.barcode);

      if (exist) {
        return prevBill.map(i =>
          i.barcode === item.barcode ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        return [...prevBill, { ...item, qty: 1 }];
      }
    });

    try {
      const ref = doc(db, "users", auth.currentUser.uid, "inventory", item.id);
      await updateDoc(ref, {
        quantity: item.quantity - 1
      });
    } catch (e) {
      console.error(e);
    }
  };

  const total = bill.reduce((s, i) => s + (i.price * i.qty), 0);

  // 🔥 Save Bill
  const saveBill = async () => {
    if (bill.length === 0) return alert("Bill empty");

    try {
      const data = {
        items: bill,
        total,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "users", auth.currentUser.uid, "sales"), data);
      await addDoc(collection(db, "users", auth.currentUser.uid, "invoices"), data);

      setBill([]);
      alert("Bill Saved");
    } catch (e) {
      console.error(e);
      alert("Failed to save bill");
    }
  };

  return (
    <div className="pos-container">

      {/* LEFT */}
      <div className="pos-left">
        <h3>📦 Inventory</h3>

        {inventory.map(i => (
          <div key={i.id} className="pos-item" onClick={() => addToBill(i)}>
            <div className="pos-item-left">
              {i.image && <img src={i.image} className="pos-img" />}
              <div>
                <div className="pos-name">{i.itemName}</div>
                <div className="pos-price">₹{i.price}</div>
              </div>
            </div>
            <span className="pos-stock">{i.quantity}</span>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="pos-right">
        <h3>🧾 Bill</h3>

        <h4 style={{ marginTop: 10 }}>📜 Today Bills</h4>
        <div className="bill-history">
          {todayBills.length === 0 && <p>No bills yet</p>}

          {todayBills.map((b, i) => (
            <div
              key={b.id}
              className="history-card"
              onClick={() => setSelectedBill(b)}
            >
              <div className="history-title">
                🧾 Bill #{i + 1} — ₹{b.total}
              </div>
              <div className="history-time">
                {b.createdAt?.toDate?.().toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <Scan onScan={addToBill} setActivePage={setActivePage} />

        <div className="current-bill-list">
  {bill.map(i => (
    <div key={i.barcode} className="bill-item">
      <span>{i.itemName} × {i.qty}</span>
      <b>₹{i.price * i.qty}</b>
    </div>
  ))}
</div>


        <div className="total">Total ₹{total}</div>

        <button className="pay-btn" onClick={saveBill}>
          💳 Pay & Save
        </button>
      </div>

      {/* 🔥 Invoice Popup */}
      {selectedBill && (
        <InvoiceView
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}

    </div>
  );
}
