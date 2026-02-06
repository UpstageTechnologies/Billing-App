import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./services/firebase";

export default function OrderHistory(){

  const customer =
    JSON.parse(localStorage.getItem("customer"));

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    if(!customer?.name) return;

    const q = query(
      collection(db,"orders"),
      where("customerName","==",customer.name)
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();

  }, [customer]);

  return (
    <div style={{ padding: 20 }}>

      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map((o, i) => (
        <div
          key={o.id}
          style={{
            background: "#fff",
            padding: 12,
            marginBottom: 10,
            borderRadius: 10
          }}
        >
          <b>Order #{i + 1}</b>

          <p>Shop : {o.shopName}</p>

          <p>Total ₹{o.total}</p>

          <p>Status :
            <b style={{
              marginLeft: 6,
              color: o.status === "pending" ? "orange" : "green"
            }}>
              {o.status}
            </b>
          </p>

          {o.items.map((it, idx) => (
            <p key={idx}>
              {it.itemName} × {it.qty}
            </p>
          ))}

        </div>
      ))}

    </div>
  );
}
