import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {

  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("buyItem"));

  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);

  if(!data) return <h2>No order</h2>;

  const placeOrder = () => {

    setLoading(true);                                       

    setTimeout(()=>{

      const orders =
        JSON.parse(localStorage.getItem("orders")) || [];

      orders.push({
        items:data.items,
        total:data.total,
        date:new Date().toLocaleString()
      });

      localStorage.setItem("orders",JSON.stringify(orders));
      localStorage.removeItem("buyItem");
      localStorage.removeItem("cart");

      setLoading(false);
      setSuccess(true);

      setTimeout(()=>{
        navigate("/customer-dashboard");
      },2000);

    },1500);
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
