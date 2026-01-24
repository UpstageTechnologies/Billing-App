import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { collection,onSnapshot,doc,updateDoc,addDoc,serverTimestamp,getDoc,setDoc} from "firebase/firestore";
import "./Sales.css";
import InvoiceView from "./InvoiceView";


export default function Sales({ setActivePage }) {
  const [inventory, setInventory] = useState([]);
  const [bill, setBill] = useState([]);
  const [todayBills, setTodayBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [holdBills, setHoldBills] = useState([]);
  const [customerMobile, setCustomerMobile] = useState("");
  const [billNo, setBillNo] = useState(1);
  const [shopName, setShopName] = useState("");
  const [shopLogo, setShopLogo] = useState("");



  /* INVENTORY */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) return;
      return onSnapshot(collection(db, "users", user.uid, "inventory"), snap =>
        setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      );
    });
    return () => unsub();
  }, []);

  /* SALES */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) return;
      return onSnapshot(collection(db, "users", user.uid, "sales"), snap =>
        setTodayBills(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      );
    });
    return () => unsub();
  }, []);
  useEffect(() => {
  const loadBillNo = async () => {
    const ref = doc(db, "global_ids", "bill_counter");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setBillNo(snap.data().value + 1);
    } else {
      await setDoc(ref, { value: 0 });
      setBillNo(1);
    }
  };
  loadBillNo();
}, []);


useEffect(() => {
  const loadShop = async () => {
    if (!auth.currentUser) return;

    const ref = doc(db, "users", auth.currentUser.uid, "settings", "shopProfile");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setShopName(snap.data().name);
      setShopLogo(snap.data().logo);
    }
  };
  loadShop();
}, []);



  /* ADD ITEM */
  const addToBill = async (item) => {
    if (item.quantity <= 0) return alert("Out of stock");

    setBill(prev => {
      const exist = prev.find(i => i.barcode === item.barcode);
      return exist
        ? prev.map(i => i.barcode === item.barcode ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
    });

    await updateDoc(doc(db, "users", auth.currentUser.uid, "inventory", item.id), {
      quantity: item.quantity - 1
    });
  };

  /* ❌ REMOVE ITEM */
  const removeItem = async (item) => {
    const exist = bill.find(i => i.barcode === item.barcode);
    if (!exist) return;

    if (exist.qty === 1) {
      setBill(prev => prev.filter(i => i.barcode !== item.barcode));
    } else {
      setBill(prev =>
        prev.map(i =>
          i.barcode === item.barcode ? { ...i, qty: i.qty - 1 } : i
        )
      );
    }

    await updateDoc(doc(db, "users", auth.currentUser.uid, "inventory", item.id), {
      quantity: item.quantity + 1
    });
  };

  /* HOLD CURRENT BILL */
  const holdCurrentBill = () => {
    if (!bill.length) return alert("Bill empty");
    setHoldBills(prev => [...prev, bill]);
    setBill([]);
  };

  /* RESTORE HOLD */
  const restoreHold = (index) => {
    setBill(holdBills[index]);
    setHoldBills(prev => prev.filter((_, i) => i !== index));
  };


const total = bill.reduce((sum, i) => {
  const gstPercent = Number(i.gst || 0);
  const base = i.price * i.qty;
  const gstAmt = base * (gstPercent / 100);
  return sum + base + gstAmt;
}, 0);


  /* SAVE */
const saveBill = async () => {
  if (!bill.length) return alert("Bill empty");

  // 🔢 BILL COUNTER UPDATE
  const counterRef = doc(db, "global_ids", "bill_counter");
  await setDoc(counterRef, { value: billNo });

  const data = {
    items: bill,
    total,
    billNo,
    customerMobile,
    createdAt: serverTimestamp()
  };

  await addDoc(collection(db, "users", auth.currentUser.uid, "sales"), data);
  await addDoc(collection(db, "users", auth.currentUser.uid, "invoices"), data);

  setBill([]);
  setBillNo(prev => prev + 1);
  setCustomerMobile("");
};



  return (
    <div className="pos-container">

      <button className="back-btn" onClick={() => setActivePage("home")}>⬅ Back</button>

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
        <div className="customer-input no-print">
  <input
    placeholder="Customer Mobile Number"
    value={customerMobile}
    onChange={e => setCustomerMobile(e.target.value)}
  />
</div>


        {/* HOLD LIST */}
        {holdBills.length > 0 && (
          <div className="hold-strip no-print">
            {holdBills.map((h, i) => (
              <button key={i} onClick={() => restoreHold(i)}>
                Hold #{i + 1}
              </button>
            ))}
          </div>
        )}

        <div className="current-bill-list">
          {shopLogo && <img src={shopLogo} className="receipt-logo" />}
        <div className="receipt-shop">{shopName}</div>

          <div className="receipt-top">
          <div>Bill No : {billNo}</div>
         {customerMobile && <div>Customer : {customerMobile}</div>}
         </div>

      <div className="bill-header">
      <span>Item</span>
      <span>Qty</span>
      <span>Price</span>
      <span>GST%</span>
     <span>Total</span>
    </div>

 {bill.map(i => (
  <div key={i.barcode} className="bill-item">
  <span>{i.itemName}</span>
  <span className="col-qty">{i.qty}</span>
  <span className="col-price">₹{i.price}</span>
  <span className="col-gst">{i.gst || 0}%</span>
  <b className="col-total">
  ₹{(i.price * i.qty) + (i.price * i.qty * ((i.gst || 0) / 100))}
  </b>


              {/* ❌ cancel */}
              <button className="cancel-btn no-print" onClick={() => removeItem(i)}>❌</button>
            </div>
          ))}
        </div>

        <div className="total"
          data-gst={(total * 0.05).toFixed(2)}
          data-grand={(total + total * 0.05).toFixed(2)}>
          Subtotal ₹{total}
        </div>

        <div className="action-bar">
          <button className="action-btn print-btn" onClick={() => window.print()}>🖨 Print</button>
          <button className="action-btn today-btn" onClick={() => setShowHistory(true)}>📜 Today Bills</button>
          <button className="action-btn hold-btn no-print" onClick={holdCurrentBill}>⏸ Hold</button>
          <button className="action-btn pay-btn" onClick={saveBill}>💳 Pay</button>
        </div>
      </div>
      {/* TODAY BILLS POPUP */}
{showHistory && (
  <div className="history-overlay no-print">
    <div className="history-modal">
      <h3>📜 Today Bills</h3>

      {todayBills.map((b, i) => (
        <div
          key={b.id}
          className="history-card"
          onClick={() => {
            setSelectedBill(b);
            setShowHistory(false);
          }}
        >
          🧾 Bill #{i + 1} — ₹{b.total}
        </div>
      ))}

      <button onClick={() => setShowHistory(false)}>Close</button>
    </div>
  </div>
)}

{selectedBill && (
  <InvoiceView bill={selectedBill} onClose={() => setSelectedBill(null)} />
)}


      {selectedBill && <InvoiceView bill={selectedBill} onClose={() => setSelectedBill(null)} />}
    </div>
  );
  
} 