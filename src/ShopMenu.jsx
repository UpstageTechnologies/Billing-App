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

  // ✅ ADD TO CART
  const addToCart = (item) => {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(c => c.id === item.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart ✅");
  };

  // ✅ BUY NOW
  const buyNow = (item) => {

    localStorage.setItem(
      "buyItem",
      JSON.stringify({ ...item, qty: 1 })
    );

    navigate("/checkout");   // create later
  };

  return (
    <div className="shopmenu">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <h2>Shop Products</h2>

      <div className="product-list">

        {items.map(i => (
          <div key={i.id} className="product-card">

            {i.image && <img src={i.image} alt={i.itemName} />}

            <h4>{i.itemName}</h4>
            <p>₹{i.price}</p>
            <span>Stock: {i.quantity}</span>

            <div className="action-row">

              <button
                className="cart-btn"
                onClick={() => addToCart(i)}
              >
                🛒 Add Cart
              </button>

              <button
                className="buy-btn"
                onClick={() => buyNow(i)}
              >
                💰 Buy
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
