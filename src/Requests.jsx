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

  const user = auth.currentUser;

  /* LOAD SHOP NAME */
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        setShopName(snap.data().shopName || "");
      }
    });
  }, [user]);

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

  const submitRequest = async () => {
    if (!selectedProduct || !offerText.trim()) {
      alert("Fill all fields");
      return;
    }

    const product = products.find(p => p.id === selectedProduct);

    await addDoc(collection(db, "offer_requests"), {
      sellerId: user.uid,
      shopName,
      productName: product.itemName,
      offerText,
      status: "pending",
      bannerImage: "",
      createdAt: serverTimestamp()
    });

    setSelectedProduct("");
    setOfferText("");
    alert("Request Sent ✅");
  };

  const filteredProducts = products.filter(p =>
    p.itemName.toLowerCase().includes(search.toLowerCase())
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
            {p.itemName}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Enter Offer"
        value={offerText}
        onChange={e => setOfferText(e.target.value)}
      />

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