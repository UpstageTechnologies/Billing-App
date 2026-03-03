import React, { useEffect, useState } from "react";
import { db } from "./services/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import "./SellerRequests.css";

export default function SellerRequests({ setActivePage }) {

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "offer_requests"), snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

const approve = async (req) => {
  await updateDoc(doc(db, "offer_requests", req.id), {
    status: "approved",
  });

  alert("Approved ✅");
};

 const makePending = async (id) => {
  await updateDoc(doc(db, "offer_requests", id), {
    status: "pending"
  });
};

  return (
    <div className="request-container">

      <button onClick={() => setActivePage("home")}>⬅ Back</button>

      <h2>Seller Requests</h2>

      {requests.map(req => (
        <RequestCard key={req.id} req={req} approve={approve} makePending={makePending}/>
      ))}

    </div>
  );
}

function RequestCard({ req, approve, makePending }) {

  return (
    <div className="request-card">
      <h4>{req.shopName}</h4>
      <p>{req.productName}</p>
      <p>{req.offerText}</p>
      <p>Status: {req.status}</p>

<div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>

  {req.status !== "approved" && (
    <button onClick={() => approve(req)}>
      Approve
    </button>
  )}

  {req.status !== "pending" && (
    <button onClick={() => makePending(req.id)}>
      Pending
    </button>
  )}

</div>
    </div>
  );
}