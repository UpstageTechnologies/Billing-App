import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import "./Requests.css";

export default function SellerOfferRequest({ setActivePage }) {

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [offerText, setOfferText] = useState("");
  const [shopName, setShopName] = useState("");
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [offerPercent, setOfferPercent] = useState("");


  /* LOAD SHOP NAME */
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        setShopName(snap.data().shopName || "");
      }
    });
  }, [user]);

  useEffect(() => {
  const unsub = auth.onAuthStateChanged(u => {
    if (u) setUser(u);
  });
  return () => unsub();
}, []);

  /* LOAD INVENTORY */
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      collection(db, "users", user.uid, "inventory"),
      snap => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );
  }, [user]);

  /* LOAD MY REQUESTS */
  useEffect(() => {
    if (!user) return;

    return onSnapshot(collection(db, "offer_requests"), snap => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.sellerId === user.uid);

      setRequests(list);
    });
  }, [user]);

     const selectedProductData = products.find(
        p => p.id === selectedProduct
      );

let finalPrice = null;

if (selectedProductData && offerPercent) {
  const discount =
    ((selectedProductData.price || 0) * Number(offerPercent)) / 100;

  finalPrice =  
   (selectedProductData.price || 0) - discount;
}

const submitRequest = async () => {

  if (!user) {
    alert("User not loaded yet");
    return;
  }

  if (!selectedProduct || !offerPercent) {
    alert("Fill all fields");
    return;
  }

  if (!selectedProductData) {
    alert("Select valid product");
    return;
  }

 await addDoc(collection(db, "offer_requests"), {
  sellerId: user.uid,
  shopName,
  productName: selectedProductData.itemName,
  originalPrice: selectedProductData.price,
  offerPercent: Number(offerPercent),
  discountedPrice: finalPrice,
  offerText,
  status: "new",   
  bannerImage: "",
  createdAt: serverTimestamp()
});

  setSelectedProduct("");
  setOfferText("");
  setOfferPercent("");

  alert("Request Sent ✅");
};

      const filteredProducts = products.filter(p =>
      p.itemName?.toLowerCase().includes(search.toLowerCase())
      );

   

  return (
    <div className="request-container">

      <button onClick={() => setActivePage("home")}>⬅ Back</button>

      <h2>Create Offer Request</h2>

      <input value={shopName} disabled />

      <input
        placeholder="Search Product"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <select
        value={selectedProduct}
        onChange={e => setSelectedProduct(e.target.value)}
      >
        <option value="">Select Product</option>
       {filteredProducts.map(p => (
        <option key={p.id} value={p.id}>
          {p.itemName} - ₹{p.price || 0}
        </option>
      ))}
      </select>

      <select
  value={offerPercent}
  onChange={e => setOfferPercent(e.target.value)}
>
  <option value="">Select Offer %</option>
  {[...Array(90)].map((_, i) => (
    <option key={i+1} value={i+0}>
      {i+0}%
    </option>
  ))}
</select>

      <textarea
        placeholder="Enter Offer"
        value={offerText}
        onChange={e => setOfferText(e.target.value)}
      />

      {selectedProductData && (
  <div className="price-box">
    <p>Original Price: ₹{selectedProductData.price}</p>

    {offerPercent && (
      <p>
        After {offerPercent}% Discount:
        <strong> ₹{finalPrice?.toFixed(2)}</strong>
      </p>
    )}
  </div>
)}

      <button onClick={submitRequest}>Submit</button>

      <h3>My Requests</h3>

      {requests.map(r => (
        <div key={r.id}>
          <strong>{r.productName}</strong>
          <p>{r.offerText}</p>
          <span>{r.status}</span>
        </div>
      ))}

    </div>
  );
}