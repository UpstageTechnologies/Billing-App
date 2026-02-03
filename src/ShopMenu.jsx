import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./services/firebase";
import "./ShopMenu.css";

export default function ShopMenu() {

  const { shopId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  // 🔥 cart state
  const [cartState, setCartState] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const [showMiniCart, setShowMiniCart] = useState(false);

  /* LOAD INVENTORY */
  useEffect(() => {
    if (!shopId) return;

    const ref = collection(db, "users", shopId, "inventory");

    const unsub = onSnapshot(ref, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [shopId]);

  /* SYNC CART */
  useEffect(() => {
    const sync = () => {
      setCartState(JSON.parse(localStorage.getItem("cart")) || []);
    };

    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  /* ✅ ADD TO CART */
  const addToCart = (item) => {

    const updated = [...cartState];

    const exist = updated.find(c => c.id === item.id);

    if (exist) {
      exist.qty += 1;
    } else {
      updated.push({
        id: item.id,
        itemName: item.itemName,
        price: Number(item.price),
        image: item.image,
        shopName: item.shopName || "Shop",
        qty: 1
      });
    }

    setCartState(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    window.dispatchEvent(new Event("cartUpdated"));

    setShowMiniCart(true);   // 🔥 show popup
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

            <button
              className="cart-btn"
              onClick={() => addToCart(i)}
            >
              Add Cart
              {cartState.find(c => c.id === i.id)?.qty > 0 && (
                <span className="badge">
                  {cartState.find(c => c.id === i.id)?.qty}
                </span>
              )}
            </button>

          </div>
        ))}

      </div>

{/* ================= MINI CART POPUP ================= */}

{showMiniCart && cartState.length > 0 && (
  <div className="mini-cart">

    <div className="mini-head">
      🛒 Cart ({cartState.reduce((s,i)=>s+i.qty,0)})
      <span onClick={() => setShowMiniCart(false)}>✖</span>
    </div>

    {cartState.slice(0,3).map(i => (
      <div key={i.id} className="mini-item">
        <img src={i.image} />
        <div>
          <p>{i.itemName}</p>
          <small>x{i.qty}</small>
        </div>
      </div>
    ))}

    <div className="mini-total">
      Total ₹{cartState.reduce((s,i)=>s+i.price*i.qty,0)}
    </div>

    <button
      className="mini-btn"
      onClick={() => navigate("/cart")}
    >
      Go to Cart
    </button>

  </div>
)}

{/* ==================================================== */}

    </div>
  );
}
