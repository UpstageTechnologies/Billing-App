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
  const [validDays, setValidDays] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* LOAD USER */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

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

  useEffect(() => {

  if (!startDate || !validDays) return;

  const start = new Date(startDate);

  start.setDate(start.getDate() + Number(validDays) - 1);

  const calculatedEnd =
    start.toISOString().split("T")[0];

  setEndDate(calculatedEnd);

}, [startDate, validDays]);


  const selectedProductData =
    products.find(p => p.id === selectedProduct);

  let finalPrice = null;

  if (selectedProductData && offerPercent) {

    const discount =
      ((selectedProductData.price || 0) * Number(offerPercent)) / 100;

    finalPrice =
      (selectedProductData.price || 0) - discount;

  }

  /* SUBMIT REQUEST */

  const submitRequest = async () => {

    if (!user) {
      alert("User not loaded yet");
      return;
    }

    if (!selectedProduct || !offerPercent || !validDays || !startDate || !endDate) {
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

      validDays: Number(validDays),

      startDate,
      endDate,

      status: "new",

      createdDate: new Date().toISOString(),

      bannerImage: "",

      createdAt: serverTimestamp()

    });

    setSelectedProduct("");
    setOfferText("");
    setOfferPercent("");
    setValidDays("");
    setStartDate("");
    setEndDate("");

    alert("Request Sent ✅");

  };

  const filteredProducts = products.filter(p =>
    p.itemName?.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="request-container">

      <button onClick={() => setActivePage("home")}>
        ⬅ Back
      </button>

      <h2>Create Offer Request</h2>

      <input value={shopName} disabled />

 <div className="product-dropdown">

  <input
    placeholder="Search & Select Product"
    value={
      selectedProductData
        ? `${selectedProductData.itemName} - ₹${selectedProductData.price}`
        : search
    }
    onChange={e => {
      setSearch(e.target.value);
      setSelectedProduct("");
    }}
    onFocus={() => setSearch("")}
  />

  {search !== "" && (

    <div className="dropdown-list">

      {filteredProducts.map(p => (

        <div
          key={p.id}
          className="dropdown-item"
          onClick={() => {
            setSelectedProduct(p.id);
            setSearch("");
          }}
        >

          {p.itemName} - ₹{p.price || 0}

        </div>

      ))}

    </div>

  )}

</div>

      {/* OFFER PERCENT */}

      <select
        value={offerPercent}
        onChange={e => setOfferPercent(e.target.value)}
      >

        <option value="">Select Offer %</option>

        {[...Array(90)].map((_, i) => (

          <option key={i+1} value={i+1}>
            {i+1}%
          </option>

        ))}

      </select>

      {/* VALID DAYS */}

      <select
        value={validDays}
        onChange={e => setValidDays(e.target.value)}
      >

        <option value="">Offer Valid Days</option>

        {[...Array(30)].map((_, i) => (

          <option key={i+1} value={i+1}>
            {i+1} Days
          </option>

        ))}

      </select>

      {/* DATE RANGE */}

      <label>Offer Start Date</label>

      <input
        type="date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
      />

      <label>Offer End Date</label>

      <input
        type="date"
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
      />

      {/* OFFER TEXT */}

      <textarea
        placeholder="Enter Offer"
        value={offerText}
        onChange={e => setOfferText(e.target.value)}
      />

      {/* PRICE PREVIEW */}

      {selectedProductData && (

        <div className="price-box">

          <p>Original Price: ₹{selectedProductData.price}</p>

          {offerPercent && (

            <p>

              After {offerPercent}% Discount :

              <strong>
                ₹{finalPrice?.toFixed(2)}
              </strong>

            </p>

          )}

        </div>

      )}

      <button onClick={submitRequest}>
        Submit
      </button>

      <h3>My Requests</h3>

      {requests.map(r => (

        <div key={r.id}>

          <strong>{r.productName}</strong>

          <p>{r.offerText}</p>

          <p>Start : {r.startDate}</p>

          <p>End : {r.endDate}</p>

          <span>{r.status}</span>

        </div>

      ))}

    </div>

  );

}