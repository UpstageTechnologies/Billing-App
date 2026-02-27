import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { collection,onSnapshot,doc,updateDoc,addDoc,serverTimestamp,getDoc,setDoc} from "firebase/firestore";
import "./Sales.css";
import { query, orderBy } from "firebase/firestore";
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

    const q = query(
      collection(db, "users", user.uid, "sales"),
      orderBy("createdAt", "desc")   // 🔥 latest first
    );

    return onSnapshot(q, snap =>
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

  const user = auth.currentUser;

  if (!user) {
    alert("User not logged in");
    return;
  }

  try {

    // Update counter
          const counterRef = doc(db, "global_ids", "bill_counter");
          const counterSnap = await getDoc(counterRef);
      let newBillNo = 1;

      if (counterSnap.exists()) {
        newBillNo = counterSnap.data().value + 1;
      }

      await setDoc(counterRef, { value: newBillNo });
      setBillNo(newBillNo);
    const data = {
      items: bill,
      total,
      billNo,
      customerMobile,
      shopName,
      shopLogo,
      createdAt: serverTimestamp()
    };

    console.log("Saving bill for user:", user.uid);

    // Save to SALES
    await addDoc(
      collection(db, "users", user.uid, "sales"),
      data
    );

    // Save to INVOICES
    const invoiceRef = await addDoc(
      collection(db, "users", user.uid, "invoices"),
      data
    );

    console.log("Invoice saved successfully:", invoiceRef.id);

    // Reset
    setBill([]);
    setBillNo(prev => prev + 1);
    setCustomerMobile("");

  } catch (error) {
    console.error("🔥 FIRESTORE ERROR:", error);
  }
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
  <span></span>  
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
          <button className="action-btn today-btn"onClick={() => setShowHistory(prev => !prev)}>📜 Today Bills</button>
          <button className="action-btn hold-btn no-print" onClick={holdCurrentBill}>⏸ Hold</button>
          <button className="action-btn pay-btn" onClick={saveBill}>💳 Pay</button>
        </div>
        {showHistory && (
  <div className="today-bills-section">
    <h4>📜 Today Bills</h4>

    <div className="today-bills-list">
{todayBills.map((b) => (
  <div
    key={b.id}
    className="today-bill-row"
    onClick={() => setSelectedBill(b)}
  >
    <div className="today-bill-left">
      🧾 Bill #{b.billNo} — ₹{b.total}
    </div>

    <div className="today-bill-date">
      {b.createdAt?.seconds
        ? new Date(b.createdAt.seconds * 1000).toLocaleDateString("en-IN")
        : ""}
    </div>
  </div>
))}
    </div>
  </div>
)}

{selectedBill && (
  <InvoiceView
    bill={selectedBill}
    shopName={shopName}
    shopLogo={shopLogo}
    onClose={() => setSelectedBill(null)}
  />
)}
      </div>



    </div>
  );
  
} 