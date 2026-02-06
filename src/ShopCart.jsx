import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ShopCart.css";

export default function ShopCart(){

const { shop } = useParams();
const navigate = useNavigate();

const [cart,setCart]=useState(
  JSON.parse(localStorage.getItem("cart"))||[]
);

const items=cart.filter(i=>i.shopName===shop);

const changeQty=(id,diff)=>{
 const updated=cart.map(i=>{
  if(i.id===id){
   const q=i.qty+diff;
   return q<=0?null:{...i,qty:q};
  }
  return i;
 }).filter(Boolean);

 setCart(updated);
 localStorage.setItem("cart",JSON.stringify(updated));
 window.dispatchEvent(new Event("cartUpdated"));
};

const total=items.reduce((s,i)=>s+i.price*i.qty,0);

return(
<div className="shopcart-page">

<button onClick={()=>navigate(-1)}>⬅ Back</button>

<h2>{shop}</h2>

{items.map(i=>(
<div key={i.id} className="shopcart-item">

<img src={i.image}/>

<div>
<h4>{i.itemName}</h4>

<div className="qty">
<button onClick={()=>changeQty(i.id,-1)}>-</button>
<span>{i.qty}</span>
<button onClick={()=>changeQty(i.id,1)}>+</button>
</div>

<p>₹{i.price*i.qty}</p>
</div>

</div>
))}

<h3>Total ₹{total}</h3>

<button
className="checkout-btn"
onClick={()=>{
 localStorage.setItem("buyItem",
  JSON.stringify({items,total})
 );
 navigate("/checkout");
}}
>
Checkout
</button>

</div>
);
}
