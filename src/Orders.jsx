import React, { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "./services/firebase";
import "./Orders.css";

export default function Orders() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), snap => {
      setOrders(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });
    return () => unsub();
  }, []);

  const confirmOrder = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "confirmed"
    });
  };

  const cancelOrder = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "cancelled"
    });
  };

  return (
    <div className="orders-page">
      <h2>Orders</h2>

      {orders.map(o => (
        <div className="order-card" key={o.id}>

          <div className="order-header">
            <h4>{o.customerName}</h4>
            <span className={`status ${o.status}`}>
              {o.status}
            </span>
          </div>

          <p className="address">{o.customerAddress}</p>
          
          <div className="items">
            {o.items.map((i, idx) => (
              <p key={idx}>
                {i.itemName} × {i.qty}
              </p>
            ))}
          </div>
          <p className="total">Total ₹{o.total}</p>


          {o.status === "pending" && (
            <div className="actions">
              <button 
                className="confirm-button"
                onClick={() => confirmOrder(o.id)}
              >
                Confirm
              </button>

              <button 
                className="cancel-button"
                onClick={() => cancelOrder(o.id)}
              >
                Cancel
              </button>
            </div>
          )}

        </div>
      ))}

    </div>
  );
}
