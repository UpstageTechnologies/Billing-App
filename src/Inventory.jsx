import React, { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import JsBarcode from "jsbarcode";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [barcodeImg, setBarcodeImg] = useState("");


  const [form, setForm] = useState({
    itemNo: "",
    itemName: "",
    price: "",
    quantity: "",
    barcode: "",
    image: ""
  });

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

  saveBarcodeImage(code); // 🔥 capture barcode image
}, 50);

  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.itemNo || !form.itemName || !form.price || !form.quantity || !form.barcode) {
      alert("Fill all fields");
      return;
    }

    if (editingId) {
      await updateDoc(
        doc(db, "users", auth.currentUser.uid, "inventory", editingId),
        form
      );
      setEditingId(null);
    } else {
      await addDoc(
        collection(db, "users", auth.currentUser.uid, "inventory"),
       {...form,
        barcodeImage: barcodeImg,   // 🔥 save barcode image
        createdAt: serverTimestamp()
       }

      );
    }

    setForm({ itemNo: "", itemName: "", price: "",quantity: "", barcode: "", image: "" });
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setForm(item);

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

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "inventory", id));
  };
  const saveBarcodeImage = (code) => {
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

      const png = canvas.toDataURL("image/png");
      setBarcodeImg(png);   // 🔥 barcode image stored
    };
  }, 200);
};


  return (
    <div className="content-card">
      <h3>📦 Inventory</h3>

      <form onSubmit={handleSubmit}>
        <input placeholder="Item No" value={form.itemNo}
          onChange={e => setForm({ ...form, itemNo: e.target.value })} />
        <input placeholder="Item Name" value={form.itemName}
          onChange={e => setForm({ ...form, itemName: e.target.value })} />
        <input placeholder="Price" value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })} />
           <input placeholder="Quantity" value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })} />

        <div style={{ gridColumn: "span 2" }}>
          <input placeholder="Barcode" value={form.barcode}
          onChange={e => {
          const val = e.target.value;
          setForm({ ...form, barcode: val });
          if (val) {JsBarcode("#barcode", val, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true
       });

  saveBarcodeImage(val);   // 🔥 capture
}
            }} />

          <button type="button" onClick={generateBarcode}>Generate Barcode</button>

          <input type="file" accept="image/*" onChange={handleImage} />

          {form.image && (
            <img src={form.image} style={{ width: 80, marginTop: 10, borderRadius: 8 }} />
          )}

          {form.barcode && <svg id="barcode" style={{ marginTop: 10 }} />}
        </div>

        <button type="submit">
          {editingId ? "Update Item" : "Add Item"}
        </button>
      </form>

      <table className="account-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Item No</th>
            <th>Name</th>
            <th>Price</th>
            <th>Barcode</th>
            <th>Qty</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.image && <img src={i.image} style={{ width: 40 }} />}</td>
              <td>{i.itemNo}</td>
              <td>{i.itemName}</td>
              <td>₹{i.price}</td>
             <td>
            <div>{i.barcode}</div>
            {i.barcodeImage && <img src={i.barcodeImage} style={{ width: 100 }} />}
              </td>
              <td>{i.quantity || 1}</td>

              <td><button onClick={() => editItem(i)}>✏</button></td>
              <td><button onClick={() => deleteItem(i.id)}>🗑</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
