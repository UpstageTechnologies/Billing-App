  import React, { useState } from "react";
  import { db, auth } from "./services/firebase";
  import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
    updateDoc
  } from "firebase/firestore";
  import BarcodeScannerComponent from "react-qr-barcode-scanner";
  import JsBarcode from "jsbarcode";

  export default function Scan({setActivePage }) {
    const [scanned, setScanned] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    /* 🔥 Generate barcode image */
    const generateBarcodeImage = (code) => {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, code, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true
      });
      return canvas.toDataURL("image/png");
    };

    const searchBarcode = async (code) => {
      const user = auth.currentUser;
      if (!user || busy) return;

      const uid = user.uid;
      setBusy(true);
      setLoading(true);

      const invRef = collection(db, "users", uid, "inventory");

      /* 🔍 Check if barcode already exists */
      const q = query(invRef, where("barcode", "==", code));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docRef = snap.docs[0].ref;
        const data = snap.docs[0].data();
        const newQty = (data.quantity || 1) + 1;

        await updateDoc(docRef, { quantity: newQty });

        setResult({ ...data, quantity: newQty });
        setIsScanning(false);
        setLoading(false);
        setTimeout(() => setBusy(false), 400);
        return;
      }

      /* 🌍 Fetch product from Vercel API (All supermarket items) */
      try {
        const res = await fetch(
          `https://scanner-api.vercel.app/api/barcode?code=${code}`
        );
        const data = await res.json();

        const name = data.name || "Unknown Product";
        const image = data.image || "";
        const price = 0;

        const barcodeImg = generateBarcodeImage(code);

        const newItem = {
          itemNo: Date.now().toString(),
          itemName: name,
          price,
          barcode: code,
          image,
          barcodeImage: barcodeImg,
          quantity: 1,
          createdAt: serverTimestamp()
        };

        await addDoc(invRef, newItem);

        setResult(newItem);
        setIsScanning(false);
      } catch (err) {
        alert("Product not found ❌");
      }

      setLoading(false);
      setTimeout(() => setBusy(false), 400);
    };

    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        
        <button
    onClick={() => setActivePage("home")}
    style={{
      marginBottom: 10,
      padding: "8px 14px",
      borderRadius: 8,
      border: "none",
      background: "#0f172a",
      color: "white",
      cursor: "pointer"
    }}
  >
    ⬅ Back
  </button><br/>
  <h2>📷 Barcode Scanner</h2>


        {!isScanning && (
          <button
            onClick={() => {
              setScanned("");
              setResult(null);
              setIsScanning(true);
            }}
            style={{
              padding: "12px 24px",
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: 20
            }}
          >
            ▶ Start Scan
          </button>
        )}

        {isScanning && (
          <BarcodeScannerComponent
            width={320}
            height={320}
            delay={20}
            facingMode="environment"
            onUpdate={(err, res) => {
              if (res) {
                const code = res.text.trim();
                if (code !== scanned) {
                  setScanned(code);
                  searchBarcode(code);
                }
              }
            }}
          />
        )}

        {loading && <p>🔍 Searching…</p>}

        {result && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 12,
              background: "#f1f5f9",
              boxShadow: "0 10px 25px rgba(0,0,0,.15)",
              maxWidth: 320,
              marginInline: "auto"
            }}
          >
            {result.image && (
              <img
                src={result.image}
                alt="product"
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}

            <h3>{result.itemName}</h3>
            <p>Price: ₹{result.price}</p>
            <p>Barcode: {result.barcode}</p>
            <p>Qty: {result.quantity}</p>

            {result.barcodeImage && (
              <img
                src={result.barcodeImage}
                style={{ width: "100%", marginTop: 10 }}
              />
            )}

            <button
              onClick={() => {
                setResult(null);
                setScanned("");
                setIsScanning(true);
              }}
              style={{
                marginTop: 12,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "#16a34a",
                color: "white",
                cursor: "pointer"
              }}
            >
              🔄 Scan Next
            </button>
          </div>
        )}
      </div>
    );
  }
