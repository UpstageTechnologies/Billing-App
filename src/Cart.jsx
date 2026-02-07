import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./services/firebase";


export default function Cart(){

const navigate = useNavigate();
const [cart,setCart] = useState(
  JSON.parse(localStorage.getItem("cart")) || []
);
const [showConfirm, setShowConfirm] = useState(false);




/* GROUP SHOP WISE */
const grouped = {};
cart.forEach(i=>{
  if(!grouped[i.shopName]) grouped[i.shopName]=[];
  grouped[i.shopName].push(i);
});

/* CHANGE QTY */
const changeQty = (id, diff)=>{
 const updated = cart
  .map(i=>{
    if(i.id===id){
      const q=i.qty+diff;
      return q<=0 ? null : {...i,qty:q};
    }
    return i;
  })
  .filter(Boolean);

 setCart(updated);
 localStorage.setItem("cart",JSON.stringify(updated));
 window.dispatchEvent(new Event("cartUpdated"));
};

/* CLEAR CART */
const clearCart = ()=>{
  setShowConfirm(true);
};
/* TOTALS */
const total = cart.reduce((s,i)=>s+i.price*i.qty,0);


return(
<div className="cart-page">

  <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
  </button>

{/* 🔴 CLEAR CART */}
<button className="clear-btn" onClick={clearCart}>
🗑 Clear Cart
</button>

<h2>Your Cart</h2>

{/* SHOP GROUP */}
{Object.keys(grouped).map(shop=>{

 const shopTotal =
  grouped[shop].reduce((s,i)=>s+i.price*i.qty,0);

 return(
 <div key={shop} className="shop-block">

  <div className="shop-head">
    <h3>{shop} - ₹{shopTotal}</h3>

    {/* SMALL CHECKOUT */}
    <button
      className="mini-checkout"
      onClick={()=>{
        localStorage.setItem("buyItem",
          JSON.stringify({
            items: grouped[shop],
            total: shopTotal
          })
        );
        navigate("/checkout");
      }}
    >
      Checkout
    </button>
  </div>

  {grouped[shop].map(i=>(
   <div key={i.id} className="cart-item">

    <img src={i.image}/>

    <div>
      <h4>{i.itemName}</h4>

      <div className="qty-row">
        <button onClick={()=>changeQty(i.id,-1)}>-</button>
        <span>{i.qty}</span>
        <button onClick={()=>changeQty(i.id,1)}>+</button>
      </div>

      <p>₹{i.price*i.qty}</p>
    </div>

   </div>
  ))}

 </div>
 );
})}

{/* GRAND TOTAL */}
<h3 className="grand-total">
Total ₹{total}
</h3>

{/* BIG CHECKOUT */}
<button
 className="checkout-btn"
 onClick={()=>{
   localStorage.setItem("buyItem",
     JSON.stringify({items:cart,total})
   );
   navigate("/checkout");
 }}
>
Checkout All Shops
</button>
{/* ===== CLEAR CART DIALOG ===== */}
{showConfirm && (
  <div className="confirm-overlay">

    <div className="confirm-box">

      <h3>Clear Cart?</h3>
      <p>Are you sure you want to clear the cart?</p>

      <div className="confirm-actions">
        <button
          className="cancel-btn"
          onClick={()=>setShowConfirm(false)}
        >
          Cancel
        </button>

        <button
          className="yes-btn"
          onClick={()=>{
            setCart([]);
            localStorage.removeItem("cart");
            window.dispatchEvent(new Event("cartUpdated"));
            setShowConfirm(false);
          }}
        >
          Yes, Clear
        </button>
      </div>

    </div>

  </div>
)}
</div>

);
}
