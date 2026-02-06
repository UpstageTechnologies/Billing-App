import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

import { addDoc, collection } from "firebase/firestore";
import { db } from "./services/firebase";

export default function Checkout() {

  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("buyItem"));

  const customer =
    JSON.parse(localStorage.getItem("customer"));

  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);

  if(!data) return <h2>No order</h2>;

  const placeOrder = async () => {

    setLoading(true);

    try{

      // 🔥 SAVE ORDER IN FIRESTORE
      await addDoc(collection(db,"orders"),{
        customerName: customer?.name || "Guest",
        customerAddress: customer?.address || "",
        shopName: data.items[0]?.shopName || "",
        items: data.items,
        total: data.total,
        status: "pending",
        createdAt: new Date()
      });

      // 🔥 ALSO SAVE IN LOCAL ORDER HISTORY
      const orders =
        JSON.parse(localStorage.getItem("orders")) || [];

      orders.push({
        items:data.items,
        total:data.total,
        date:new Date().toLocaleString()
      });

      localStorage.setItem("orders",JSON.stringify(orders));

      // 🔥 CLEAR CART
      localStorage.removeItem("buyItem");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      setSuccess(true);

      setTimeout(()=>{
        navigate("/customer-dashboard");
      },2000);

    }catch(err){
      alert("Order failed");
      console.log(err);
    }

    setLoading(false);
  };

  if(loading){
    return(
      <div className="loader-wrap">
        <div className="loader"></div>
      </div>
    );
  }

  if(success){
    return(
      <div className="success-wrap">
        <div className="success-card">
          <div className="check-circle">✓</div>
          <h2>Order Placed!</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">

      <div className="checkout-card">

        {data.items.map(i=>(
          <p key={i.id}>
            {i.itemName} x {i.qty}
          </p>
        ))}

        <h2>Total ₹{data.total}</h2>

        <button onClick={placeOrder}>
          💳 Pay Now
        </button>

      </div>

    </div>
  );
}
