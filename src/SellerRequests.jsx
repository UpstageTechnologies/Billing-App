import React, { useEffect, useState } from "react";
import { db } from "./services/firebase";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import "./SellerRequests.css";

export default function SellerRequests({ setActivePage }) {

  const [requests, setRequests] = useState([]);

  const newRequests = requests.filter(r => !r.status || r.status === "new");
  const approvedRequests = requests.filter(r => r.status === "approved");
  const pendingRequests = requests.filter(r => r.status === "pending");

  useEffect(() => {
    return onSnapshot(collection(db, "offer_requests"), snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const approve = async (req) => {
    await updateDoc(doc(db, "offer_requests", req.id), {
      status: "approved",
    });
  };

  const makePending = async (id) => {
    await updateDoc(doc(db, "offer_requests", id), {
      status: "pending",
    });
  };

  return (

<div className="sr-container">

<button className="sr-back-btn" onClick={() => setActivePage("home")}>
⬅ Back
</button>

{/* REQUESTS TOP */}

<div className="sr-requests-section">

<h3>Requests</h3>

{newRequests.map(req => (
<RequestCard
key={req.id}
req={req}
approve={approve}
makePending={makePending}
/>
))}

</div>


{/* APPROVED + PENDING */}

<div className="sr-bottom-columns">

<div className="sr-column">

<h3>Approved</h3>

{approvedRequests.map(req => (
<RequestCard
key={req.id}
req={req}
approve={approve}
makePending={makePending}
/>
))}

</div>


<div className="sr-column">

<h3>Pending</h3>

{pendingRequests.map(req => (
<RequestCard
key={req.id}
req={req}
approve={approve}
makePending={makePending}
/>
))}

</div>

</div>

</div>

  );
}

function RequestCard({ req, approve, makePending }) {

  return (

<div className="sr-card">

<h4>{req.shopName}</h4>
<p>{req.productName}</p>
<p>{req.offerText}</p>

<p>Offer Days: {req.validDays}</p>
<p>Start: {req.startDate}</p>
<p>End: {req.endDate}</p><p>Created Date: {req.createdDate?.slice(0,10)}</p>

<p>Status: {req.status || "new"}</p>

<div className="sr-btn-group">

{req.status !== "approved" && (
<button
className="sr-approve-btn"
onClick={() => approve(req)}
>
Approve
</button>
)}

{req.status !== "pending" && (
<button
className="sr-pending-btn"
onClick={() => makePending(req.id)}
>
Pending
</button>
)}

</div>

</div>

  );
}