import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./services/firebase";
import "./ShopMenu.css";

export default function ShopMenu() {

  const { shopId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!shopId) return;

    const ref = collection(db, "users", shopId, "inventory");

    const unsub = onSnapshot(ref, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [shopId]);

  return (
    <div className="shopmenu">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <h2>Shop Products</h2>

      <div className="product-list">
        {items.map(i => (
<div key={i.id} className="product-card">

  {i.image && <img src={i.image} />}

  <h4>{i.itemName}</h4>
  <p>₹{i.price}</p>
  <span>Stock: {i.quantity}</span>

  <div className="action-row">
    <button className="cart-btn">🛒Add Cart</button>
    <button className="buy-btn">💰  Buy</button>
  </div>

</div>

        ))}
      </div>

    </div>
  );
}
