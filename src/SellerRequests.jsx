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

  const approve = async (req, banner) => {
    if (!banner) return alert("Upload banner");

    await updateDoc(doc(db, "offer_requests", req.id), {
      status: "approved",
      bannerImage: banner
    });

    const uiRef = doc(db, "settings", "customerUI");
    const snap = await getDoc(uiRef);

    let banners = snap.exists() ? snap.data().banners || [] : [];
    banners.unshift(banner);

    await setDoc(uiRef, { banners }, { merge: true });

    alert("Approved ✅");
  };

  const reject = async id => {
    await updateDoc(doc(db, "offer_requests", id), {
      status: "rejected"
    });
  };

  return (
    <div className="request-container">

      <button onClick={() => setActivePage("home")}>⬅ Back</button>

      <h2>Seller Requests</h2>

      {requests.map(req => (
        <RequestCard key={req.id} req={req} approve={approve} reject={reject}/>
      ))}

    </div>
  );
}

function RequestCard({ req, approve, reject }) {

  const [banner, setBanner] = useState("");

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBanner(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="request-card">
      <h4>{req.shopName}</h4>
      <p>{req.productName}</p>
      <p>{req.offerText}</p>
      <p>Status: {req.status}</p>

      {req.status === "pending" && (
        <>
          <input type="file" onChange={handleImage} />
          <button onClick={() => approve(req, banner)}>Approve</button>
          <button onClick={() => reject(req.id)}>Reject</button>
        </>
      )}
    </div>
  );
}