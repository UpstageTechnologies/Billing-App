import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import Scan from "./Scan";

export default function Sales({ setActivePage }) {
  const [inventory, setInventory] = useState([]);
  const [bill, setBill] = useState([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "inventory");

      onSnapshot(ref, snap => {
        setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    });
    return () => unsub();
  }, []);

  // 🔥 Add item to bill
  const addToBill = async (item) => {
    if (item.quantity <= 0) return alert("Out of stock");

    const exist = bill.find(i => i.barcode === item.barcode);

    if (exist) {
      setBill(bill.map(i => i.barcode === item.barcode ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setBill([...bill, { ...item, qty: 1 }]);
    }

    // 🔥 reduce inventory
    await updateDoc(
      doc(db, "users", auth.currentUser.uid, "inventory", item.id),
      { quantity: item.quantity - 1 }
    );
  };

  const total = bill.reduce((s, i) => s + (i.price * i.qty), 0);

  const saveBill = async () => {
    await addDoc(collection(db, "users", auth.currentUser.uid, "sales"), {
      items: bill,
      total,
      createdAt: serverTimestamp()
    });
    setBill([]);
    alert("Bill Saved");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT – Inventory */}
      <div style={{ width: "40%", overflowY: "auto", padding: 10 }}>
        <button onClick={() => setActivePage("home")}>⬅ Back</button>
        <h3>📦 Inventory</h3>
        {inventory.map(i => (
          <div key={i.id}
            style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #ddd", cursor: "pointer" }}
            onClick={() => addToBill(i)}
          >
            <span>{i.itemName}</span>
            <b>{i.quantity}</b>
          </div>
        ))}
      </div>

      {/* RIGHT – Bill + Scanner */}
      <div style={{ width: "60%", padding: 10 }}>
        <h3>🧾 Bill</h3>

        <Scan onScan={addToBill} />

        {bill.map(i => (
          <div key={i.barcode} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{i.itemName} × {i.qty}</span>
            <b>₹{i.price * i.qty}</b>
          </div>
        ))}

        <h2>Total: ₹{total}</h2>

        <button
          onClick={saveBill}
          style={{ width: "100%", padding: 15, background: "green", color: "white", fontSize: 18 }}
        >
          💳 Pay & Save
        </button>
      </div>

    </div>
  );
}
