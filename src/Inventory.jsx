import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import "./Inventory.css";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from "firebase/firestore";

import JsBarcode from "jsbarcode";

export default function Inventory({setActivePage}) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [barcodeImg, setBarcodeImg] = useState("");

 const [form, setForm] = useState({
  itemNo: "",
  itemName: "",
  price: "",
  quantity: "",
  barcode: "",
  gst: "0",
  image: ""
});
useEffect(() => {
  if (!auth.currentUser) return;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      await setDoc(
  doc(db, "users", auth.currentUser.uid, "settings", "shopProfile"),
  {
    name: form.shopName || "",
    address: form.shopAddress || "",
    logo
  },
  { merge: true }
);

    },
    () => {
      console.warn("Shop location permission denied");
    }
  );
}, []);


  // 🔥 Live Inventory Sync
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "inventory");

      const unsubData = onSnapshot(ref, (snap) => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => unsubData();
    });

    return () => unsubAuth();
  }, []);

  // 🔥 Barcode Generator
  const generateBarcode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const code = "BC" + Date.now() + random;
    setForm({ ...form, barcode: code });

    setTimeout(() => {
      JsBarcode("#barcode", code, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true
      });

      saveBarcodeImage(code);
    }, 50);
  };

  // 🔥 Product Image
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  // 🔥 Add / Update Item
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.itemNo || !form.itemName || !form.price || !form.quantity || !form.barcode) {
      alert("Fill all fields");
      return;
    }

    if (editingId) {
      await updateDoc(
        doc(db, "users", auth.currentUser.uid, "inventory", editingId),
        { ...form, barcodeImage: barcodeImg }   // 🔥 FIX
      );
      setEditingId(null);
    } else {
      await addDoc(
        collection(db, "users", auth.currentUser.uid, "inventory"),
        {
          ...form,
          barcodeImage: barcodeImg,
          createdAt: serverTimestamp()
        }
      );
    }

    setForm({ itemNo: "", itemName: "", price: "", quantity: "", barcode: "", image: "" });
  };

  // 🔥 Edit Item
  const editItem = (item) => {
    setEditingId(item.id);
    setForm({
      itemNo: item.itemNo,
      itemName: item.itemName,
      price: item.price,
      quantity: item.quantity,
      barcode: item.barcode,
      image: item.image || ""
    });

    setBarcodeImg(item.barcodeImage || "");

    setTimeout(() => {
      if (item.barcode) {
        JsBarcode("#barcode", item.barcode, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true
        });
      } 
    }, 100);
  };

  // 🔥 Delete
  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "inventory", id));
  };

  // 🔥 Convert Barcode SVG → PNG
  const saveBarcodeImage = () => {
    setTimeout(() => {
      const svg = document.getElementById("barcode");
      if (!svg) return;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svgStr);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setBarcodeImg(canvas.toDataURL("image/png"));
      };
    }, 200);
  };

  return (
    <div className="content-card">
      
      <button
  onClick={() => setActivePage("home")}
  style={{
    marginBottom: 12,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "white",
    cursor: "pointer"
  }}
>
  ⬅ Back
</button>
<br/>
{/* 🏪 SHOP PROFILE */}
<div className="shop-profile">
  <h3>🏪 Shop Profile</h3>

  <input
    placeholder="Shop Name"
    value={form.shopName || ""}
    onChange={e => setForm({ ...form, shopName: e.target.value })}
  />
  <input
  placeholder="Shop Address"
  value={form.shopAddress || ""}
  onChange={e => setForm({ ...form, shopAddress: e.target.value })}
/>


  <input type="file" accept="image/*" onChange={e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const logo = reader.result;

    await setDoc(
  doc(db,"users",auth.currentUser.uid,"settings","shopProfile"),
  {
    name: form.shopName,
    address: form.shopAddress,
    logo
  },
  { merge: true }
);

      

      alert("Shop profile saved ✅");
    };
    reader.readAsDataURL(file);
  }} />
</div>

<h3>📦 Inventory</h3><br/>
      <input
  type="text"
  placeholder="🔍 Search by Item No or Name..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    padding: "10px",
    width: "100%",
    maxWidth: "320px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>


      <form onSubmit={handleSubmit}>
        <input placeholder="Item No" value={form.itemNo}
          onChange={e => setForm({ ...form, itemNo: e.target.value })} />
        <input placeholder="Item Name" value={form.itemName}
          onChange={e => setForm({ ...form, itemName: e.target.value })} />
        <input placeholder="Price" value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Quantity" value={form.quantity}
          onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /> {/* 🔥 FIX */}
        <input placeholder="GST %"value={form.gst}onChange={e => setForm({ ...form, gst: e.target.value })}/>


        <div style={{ gridColumn: "span 2" }}>
          <input placeholder="Barcode" value={form.barcode}
            onChange={e => {
              const val = e.target.value;
              setForm({ ...form, barcode: val });
              if (val) {
                JsBarcode("#barcode", val, {
                  format: "CODE128",
                  width: 2,
                  height: 50,
                  displayValue: true
                });
                saveBarcodeImage();
              }
            }} />

          <button type="button" onClick={generateBarcode}>Generate Barcode</button>

          <input type="file" accept="image/*" onChange={handleImage} />

          {form.image && <img src={form.image} style={{ width: 80, marginTop: 10 }} />}

          {form.barcode && <svg id="barcode" style={{ marginTop: 10 }} />}
        </div>

        <button type="submit">{editingId ? "Update Item" : "Add Item"}</button>
      </form>

      <table className="account-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Item No</th>
            <th>Name</th>
            <th>Price</th>
            <th>Barcode</th>
            <th>GST %</th>  
            <th>Qty</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
      {items
  .filter(i =>
    String(i.itemNo).toLowerCase().includes(search.toLowerCase()) ||
    String(i.itemName).toLowerCase().includes(search.toLowerCase())
  )
  .map(i => (


        <tr key={i.id}>
  <td>{i.image && <img src={i.image} style={{ width: 40 }} />}</td>
  <td>{i.itemNo}</td>
  <td>{i.itemName}</td>
  <td>₹{i.price}</td>

  <td>
    {i.barcode}
    {i.barcodeImage && <img src={i.barcodeImage} style={{ width: 100 }} />}
  </td>

  <td>{i.gst || 0}%</td>   

  <td>{i.quantity}</td>
  <td><button onClick={() => editItem(i)}>✏</button></td>
  <td><button onClick={() => deleteItem(i.id)}>🗑</button></td>
</tr>

 ))}
        </tbody>
      </table>
    </div>
  );
}