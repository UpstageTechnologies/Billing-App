import React from "react";

export default function OrderHistory(){

 const orders =
   JSON.parse(localStorage.getItem("orders")) || [];

 return (
  <div style={{padding:20}}>
    <h2>My Orders</h2>

    {orders.length===0 && <p>No orders yet</p>}

    {orders.map((o,i)=>(
      <div key={i}
       style={{
         background:"#fff",
         padding:12,
         marginBottom:10,
         borderRadius:10
       }}
      >
        <b>Order #{i+1}</b>
        <p>Total ₹{o.total}</p>
        <p>Items: {o.items.length}</p>
      </div>
    ))}
  </div>
 );
}
