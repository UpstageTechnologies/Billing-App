import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart() {

const item = JSON.parse(localStorage.getItem("buyItem"));
if(item?.items){
 return (
  <div className="checkout">
   <h2>Checkout</h2>
   {item.items.map(i=>(
    <p key={i.id}>{i.itemName} x {i.qty}</p>
   ))}
   <h3>Total ₹{item.total}</h3>

   <button onClick={placeOrder}>
     Pay Now
   </button>
  </div>
 );
}


  const navigate = useNavigate();
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const removeItem = (id) => {
    const updated = cart.filter(i => i.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );
  const changeQty = (id, diff) => {

  const updated = cart.map(i=>{
    if(i.id===id){
      const newQty = i.qty + diff;
      return newQty<=0 ? i : {...i, qty:newQty};
    }
    return i;
  });

  setCart(updated);
  localStorage.setItem("cart",JSON.stringify(updated));
};


  return (
    <div className="cart-page">

      <h2>Your Cart</h2>

      {cart.length === 0 && <p>Cart Empty</p>}

      {cart.map(i => (
        <div key={i.id} className="cart-item">

          <img src={i.image} />

          <div>
            <h4>{i.itemName}</h4>
            <div className="qty-row">
            <button onClick={()=>changeQty(i.id,-1)}>-</button>
            <span>{i.qty}</span>
            <button onClick={()=>changeQty(i.id,1)}>+</button>
            </div>
            <p>₹{i.price * i.qty}</p>
          </div>

          <button onClick={() => removeItem(i.id)}>❌</button>

        </div>
      ))}

      {cart.length > 0 && (
        <>
          <h3>Total ₹{total}</h3>

        <button
  className="checkout-btn"
  onClick={()=>{
    localStorage.setItem(
      "buyItem",
      JSON.stringify({
        items:cart,
        total
      })
    );
    navigate("/checkout");
  }}
>
Checkout
</button>


        </>
      )}

    </div>
  );
}
