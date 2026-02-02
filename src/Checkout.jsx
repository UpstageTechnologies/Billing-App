import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {

  const navigate = useNavigate();
  const item = JSON.parse(localStorage.getItem("buyItem"));

  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);

  if (!item) return <h2>No item selected</h2>;

  const placeOrder = () => {

    setLoading(true);

    setTimeout(()=>{
      const orders =
        JSON.parse(localStorage.getItem("orders")) || [];

      orders.push({
        items:item.items || [item],
        total:item.total || (item.price * item.qty),
        payment:"UPI",
        date:new Date().toLocaleString()
      });

      localStorage.setItem("orders",JSON.stringify(orders));
      localStorage.removeItem("buyItem");

      setLoading(false);
      setSuccess(true);

      setTimeout(()=>{
        navigate("/customer-dashboard");
      },2500);

    },1500);   // fake payment delay
  };

  /* LOADING */
  if(loading){
    return(
      <div className="loader-wrap">
        <div className="loader"></div>
      </div>
    );
  }

  /* SUCCESS */
  if(success){
    return(
      <div className="success-wrap">
        <div className="success-card">
          <div className="check-circle">✓</div>
          <h2>Order Placed!</h2>
          <p>Thank you for shopping 😊</p>
        </div>
      </div>  
    );
  }

  return (
    <div className="checkout">

      <div className="checkout-card">

        {item.image && <img src={item.image} />}

        <h3>{item.itemName}</h3>

        <p>Qty: {item.qty}</p>
        <h2>Total ₹{item.price * item.qty}</h2>

        <button onClick={placeOrder}>
          💳 Pay Now
        </button>

      </div>

    </div>
  );
}
