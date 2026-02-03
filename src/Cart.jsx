import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart(){

const navigate = useNavigate();
const [cart,setCart] = useState(
  JSON.parse(localStorage.getItem("cart")) || []
);

const grouped = {};
cart.forEach(i=>{
  if(!grouped[i.shopName]) grouped[i.shopName]=[];
  grouped[i.shopName].push(i);
});

const changeQty = (id, diff)=>{
 const updated = cart.map(i=>{
  if(i.id===id){
   const q=i.qty+diff;
   return q<=0 ? i : {...i,qty:q};
  }
  return i;
 });
 setCart(updated);
 localStorage.setItem("cart",JSON.stringify(updated));
 window.dispatchEvent(new Event("cartUpdated"));
};

const total = cart.reduce((s,i)=>s+i.price*i.qty,0);

return(
<div className="cart-page">

<h2>Your Cart</h2>

{Object.keys(grouped).map(shop=>(
 <div key={shop}>

  <h3 className="shop-head">{shop}</h3>

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
))}

<h3>Total ₹{total}</h3>

<button
 className="checkout-btn"
 onClick={()=>{
   localStorage.setItem("buyItem",
     JSON.stringify({items:cart,total})
   );
   navigate("/checkout");
 }}
>
Checkout
</button>

</div>
);
}
