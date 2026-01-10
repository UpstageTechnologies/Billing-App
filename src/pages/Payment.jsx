import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

import { auth, db } from "../services/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";

const Payment = () => {
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);

  const activateBasic = async () => {
    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          plan: "basic",
          isActive: true,
          planSince: new Date(),
          planExpiry: null,
        },
        { merge: true }
      );
    }

  setTimeout(() => {
  window.location.href = "/dashboard";
}, 1200);
  };

  const handlePaymentSuccess = async (planName) => {
    const user = auth.currentUser;
    if (!user) return;

    let planValue = planName === "Premium" ? "premium" : "lifetime";
    let planExpiry = planValue === "premium" ? new Date() : null;

    if (planExpiry) planExpiry.setDate(planExpiry.getDate() + 30);

    await updateDoc(doc(db, "users", user.uid), {
      plan: planValue,
      isActive: true,
      planSince: new Date(),
      planExpiry,
    });
setShowPopup(true);setTimeout(() => {
window.location.href = "/dashboard";
}, 1200);

  };

  const pay = (amt, name) => {
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amt * 100,
      currency: "INR",
      name: "BillPro",
      description: name,
      handler: () => handlePaymentSuccess(name),
    });
    rzp.open();
  };

  return (
    <div className="wrapper">
      <div className="payment-body">
        <div className="payment-wrapper">
          <h2 className="payment-title">Choose Your Power Plan ⚡</h2>
          <p className="payment-subtitle">Colorful • Animated • No Hidden Fees</p>

          <div className="payment-container">
            {/* BASIC */}
            <div className="plan-box basic">
              <h3>Basic</h3>
              <p className="desc">Perfect for starters</p>

              <ul className="tick">
                <li>GST Invoicing</li>
                <li>200 Customers</li>
                <li>3 Categories</li>
              </ul>

              <ul className="wrong">
                <li>Multi-User Access</li>
                <li>Reports</li>
              </ul>

              <h3 className="price">₹0</h3>

              <button className="choose-btn basic-btn" onClick={activateBasic}>
                Continue Free
              </button>
            </div>

            {/* PREMIUM */}
            <div className="plan-box premium">
              <h3>Premium</h3>
              <p className="desc">Full access — 30 days</p>

              <ul className="tick">
                <li>Unlimited Invoices</li>
                <li>Unlimited Customers</li>
                <li>Multi-User Access</li>
                <li>Stock Management</li>
                <li>Reports</li>
              </ul>

              <h3 className="price">
                ₹299 <span className="old">₹399</span>
              </h3>

              <button
                className="choose-btn premium-btn"
                onClick={() => pay(299, "Premium")}
              >
                Get Premium
              </button>
            </div>

            {/* LIFETIME */}
            <div className="plan-box lifetime">
              <h3>Lifetime</h3>
              <p className="desc">One-time — use forever</p>

              <ul className="tick">
                <li>Everything in Premium</li>
                <li>Priority Support</li>
                <li>Free Updates</li>
              </ul>

              <h3 className="price">
                ₹999 <span className="old">₹1999</span>
              </h3>

              <button
                className="choose-btn lifetime-btn"
                onClick={() => pay(999, "Lifetime")}
              >
                Buy Lifetime
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- SUCCESS POPUP ---------- */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            🎉 <b>Payment Successful!</b>
            <p>Your plan has been activated.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
