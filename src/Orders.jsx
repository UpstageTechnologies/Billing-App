import React, { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "./services/firebase";
import "./Orders.css";

export default function Orders({ setActivePage }) {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), snap => {
      setOrders(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });
    return () => unsub();
  }, []);

  const setPending = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "pending"
    });
  };

  const setConfirmed = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "confirmed"
    });
  };

  const setDelivered = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "delivered"
    });
  };

  const cancelOrder = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "cancelled"
    });
  };

  return (
    <div className="orders-page">

      <button className="back-btn" onClick={() => setActivePage("home")}>
        ⬅ Back
      </button>

      <h2>Orders</h2>

<div className="orders-section">

{/* NEW ORDERS */}

<h3>New Orders</h3>

{orders.filter(o => o.status === "new").map(o => (

  <div className="order-card" key={o.id}>

    <div className="order-header">
      <h4>{o.customerName}</h4>
      <span className={`status ${o.status}`}>{o.status}</span>
    </div>

    <p className="address">{o.customerAddress}</p>

    <div className="items">
      {o.items.map((i,idx)=>(
        <p key={idx}>{i.itemName} × {i.qty}</p>
      ))}
    </div>

    <p className="total">Total ₹{o.total}</p>

  <div className="actions">

  <button
    className="pending-button"
    onClick={()=>setPending(o.id)}
  >
    Pending
  </button>

  <button
    className="confirm-button"
    onClick={()=>setConfirmed(o.id)}
  >
    Confirm
  </button>

  <button
    className="cancel-button"
    onClick={()=>cancelOrder(o.id)}
  >
    Cancel
  </button>

</div>

  </div>

))}

</div>


{/* 3 COLUMN LAYOUT */}

<div className="order-columns">


{/* PENDING */}

<div>

<h3>Pending</h3>

{orders.filter(o => o.status === "pending").map(o => (

<div className="order-card small" key={o.id}>

<h4>{o.customerName}</h4>

<div className="items">
{o.items.map((i,idx)=>(
<p key={idx}>{i.itemName} × {i.qty}</p>
))}
</div>

<p className="total">Total ₹{o.total}</p>

<div className="actions">
<button
className="confirm-button"
onClick={()=>setConfirmed(o.id)}
>
Confirm
</button>

<button
className="cancel-button"
onClick={()=>cancelOrder(o.id)}
>
Cancel
</button>
</div>

</div>

))}

</div>


{/* CONFIRMED */}

<div>

<h3>Confirmed</h3>

{orders.filter(o => o.status === "confirmed").map(o => (

<div className="order-card small" key={o.id}>

<h4>{o.customerName}</h4>

<div className="items">
{o.items.map((i,idx)=>(
<p key={idx}>{i.itemName} × {i.qty}</p>
))}
</div>

<p className="total">Total ₹{o.total}</p>

<div className="actions">

<button
className="delivered-button"
onClick={()=>setDelivered(o.id)}
>
Deliver
</button>

<button
className="pending-button"
onClick={()=>setPending(o.id)}
>
Pending
</button>

<button
className="cancel-button"
onClick={()=>cancelOrder(o.id)}
>
Cancel
</button>

</div>

</div>

))}

</div>


{/* DELIVERED */}

<div>

<h3>Delivered</h3>

{orders.filter(o => o.status === "delivered").map(o => (

<div className="order-card small" key={o.id}>

<h4>{o.customerName}</h4>

<div className="items">
{o.items.map((i,idx)=>(
<p key={idx}>{i.itemName} × {i.qty}</p>
))}
</div>

<p className="total">Total ₹{o.total}</p>

<span className="status delivered">
Delivered
</span>

</div>

))}

</div>

</div> 

</div> 

);
}