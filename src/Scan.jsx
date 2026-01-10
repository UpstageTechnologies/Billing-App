import React, { useState } from "react";
import { db, auth } from "./services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function Scan() {
  const [scanned, setScanned] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const searchBarcode = async (code) => {
    const user = auth.currentUser;   // 🔥 FIX 1
    if (!user || busy) return;

    const uid = user.uid;

    setBusy(true);
    setLoading(true);

    const invRef = collection(db, "users", uid, "inventory");

    // 🔍 1. Check in Firestore
    const q = query(invRef, where("barcode", "==", code));
    const snap = await getDocs(q);

    // 🔥 FIX 2 — If exists, increase quantity
    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      const data = snap.docs[0].data();

      await updateDoc(docRef, {
        quantity: (data.quantity || 1) + 1
      });

      setResult({ ...data, quantity: (data.quantity || 1) + 1 });
      setIsScanning(false);
      setLoading(false);
      setTimeout(() => setBusy(false), 400);
      return;
    }

    // 🌍 2. Not in DB → Search Online
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`
      );
      const data = await res.json();

      let name = "Unknown Product";
      let image = "";
      let price = 0;

      // 🔥 FIX 3 — Correct API check
      if (data.status === 1) {
        name =
          data.product.product_name ||
          data.product.brands ||
          "Unknown Product";

        image = data.product.image_front_url || "";
      }

      const newItem = {
        itemNo: Date.now().toString(),
        itemName: name,
        price,
        barcode: code,
        image,
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
          <p>Qty: {result.quantity || 1}</p>

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
