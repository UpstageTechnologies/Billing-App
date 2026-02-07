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

export default function Inventory({ setActivePage }) {

const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [barcodeImg, setBarcodeImg] = useState("");
  const [shopLogo,setShopLogo] = useState("");


  const [form, setForm] = useState({
    itemNo:"",
    itemName:"",
    price:"",
    quantity:"",
    barcode:"",
    gst:"0",
    image:"",
    category:"",    
    shopName:"",
    shopAddress:"",
    lat:null,
    lng:null
  });

/* ✅ GET SHOP LOCATION ONCE */ 
useEffect(() => {
  if (!auth.currentUser) return;

  navigator.geolocation.getCurrentPosition(
    (pos)=>{
      setForm(prev=>({
        ...prev,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }));
      console.log("Shop Location:",pos.coords.latitude,pos.coords.longitude);
    },
    ()=> alert("Please allow location access")
  );
},[]);

/* ✅ INVENTORY LIVE */
useEffect(()=>{
  const unsub = auth.onAuthStateChanged(user=>{
    if(!user) return;
    return onSnapshot(
      collection(db,"users",user.uid,"inventory"),
      snap=> setItems(snap.docs.map(d=>({id:d.id,...d.data()})))
    );
  });
  return ()=>unsub();
},[]);

useEffect(()=>{
  if(!auth.currentUser) return;

  onSnapshot(
    doc(db,"users",auth.currentUser.uid,"settings","shopProfile"),
    snap=>{
      if(snap.exists()){
        setShopLogo(snap.data().logo || "");
      }
    }
  );
},[]);

/* BARCODE */
const generateBarcode = () => {
  const code = "BC"+Date.now();
  setForm({...form,barcode:code});
  setTimeout(()=>{
    JsBarcode("#barcode",code,{format:"CODE128",width:2,height:50});
    saveBarcodeImage();
  },50);
};

const saveBarcodeImage = () =>{
  setTimeout(()=>{
    const svg=document.getElementById("barcode");
    if(!svg) return;
    const xml=new XMLSerializer().serializeToString(svg);
    const canvas=document.createElement("canvas");
    const ctx=canvas.getContext("2d");
    const img=new Image();
    img.src="data:image/svg+xml;base64,"+btoa(xml);
    img.onload=()=>{
      canvas.width=img.width;
      canvas.height=img.height;
      ctx.drawImage(img,0,0);
      setBarcodeImg(canvas.toDataURL("image/png"));
    };
  },200);
};

/* IMAGE */
const handleImage=(e)=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onloadend=()=>setForm({...form,image:reader.result});
  reader.readAsDataURL(file);
};

/* ADD ITEM */
const handleSubmit=async(e)=>{
  e.preventDefault();

  if(editingId){
    await updateDoc(
      doc(db,"users",auth.currentUser.uid,"inventory",editingId),
      {...form,barcodeImage:barcodeImg}
    );
    setEditingId(null);
  }else{
    await addDoc(
      collection(db,"users",auth.currentUser.uid,"inventory"),
      {...form,barcodeImage:barcodeImg,createdAt:serverTimestamp()}
    );
  }

setForm({
  itemNo:"",
  itemName:"",
  price:"",
  quantity:"",
  barcode:"",
  gst:"0",
  image:"",
  category:"",
  shopName: form.shopName,
  shopAddress: form.shopAddress,
  lat: form.lat,
  lng: form.lng
});

setBarcodeImg("");
};

/* DELETE */
const deleteItem=async(id)=>{
  await deleteDoc(doc(db,"users",auth.currentUser.uid,"inventory",id));
};

/* EDIT */
const editItem = (i) => {
  setEditingId(i.id);
  setForm({...i});
  setBarcodeImg(i.barcodeImage || "");

  if(i.barcode){
    setTimeout(()=>{
      JsBarcode("#barcode", i.barcode, {format:"CODE128",width:2,height:50});
    },50);
  }
};


return(

<div>
        <button className="back-btn" onClick={() => setActivePage("home")}>⬅ Back</button>

<div className="content-card">
    

  
<div className="inv-header">

  {shopLogo && (
    <img
      src={shopLogo}
      className="shop-logo"
    />
  )}


</div>




<form onSubmit={handleSubmit}>

<input placeholder="Item No"  
value={form.itemNo}
onChange={e=>setForm({...form,itemNo:e.target.value})}/>

<input placeholder="Item Name"
value={form.itemName}
onChange={e=>setForm({...form,itemName:e.target.value})}/>

<input placeholder="Price"
value={form.price}
onChange={e=>setForm({...form,price:e.target.value})}/>

<input placeholder="Quantity"
value={form.quantity}
onChange={e=>setForm({...form,quantity:Number(e.target.value)})}/>

<input placeholder="GST %"
value={form.gst}
onChange={e=>setForm({...form,gst:e.target.value})}/>

<select
  value={form.category}
  onChange={e=>setForm({...form,category:e.target.value})}
  required
>
  <option value="">Select Category</option>
  <option value="Groceries">Groceries</option>
  <option value="Snacks">Snacks</option>
  <option value="Drinks">Drinks</option>
  <option value="Household">Household</option>
</select>


<input placeholder="Barcode"
value={form.barcode}
onChange={e=>{
setForm({...form,barcode:e.target.value});
JsBarcode("#barcode",e.target.value);
saveBarcodeImage();
}}/>

<input type="file" accept="image/*" onChange={handleImage}/>
{form.image && (
  <img
    src={form.image}
    style={{ width:80, marginTop:10, borderRadius:6 }}
  />
)}


<button type="button" onClick={generateBarcode}>Generate Barcode</button>


{form.barcode && <svg id="barcode"></svg>}

<button type="submit">{editingId?"Update":"Add"} Item</button>

{/* 🔍 SEARCH */}
<input placeholder="Search"
value={search}
onChange={e=>setSearch(e.target.value)}/>

</form>
<table className="account-table">
<thead>
<tr>
<th>item.No</th>
<th>Image</th>
<th>Name</th>
<th>Price</th>
<th>Qty</th>
<th>Barcode</th>
<th>Edit</th>
<th>Del</th>
</tr>
</thead>

<tbody>
  
{items
  .filter(i =>
    i.itemName.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a,b)=> a.itemName.localeCompare(b.itemName))
  .map((i,index) => (

<tr key={i.id}>
<td>{index + 1}</td>
                <td>
<div style={{ display:"flex", gap:6, alignItems:"center" }}>

    {i.image && (
      <img
        src={i.image}
        style={{ width:70, height:70, objectFit:"contain" }}
      />
    )}
  </div>
</td>

<td>{i.itemName}</td>
<td>{i.price}</td>
<td>{i.quantity}</td>

{/* ✅ BARCODE TEXT + IMAGE */}
<td>
  <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
    <small>{i.barcode}</small>
    {i.barcodeImage && (
      <img 
        src={i.barcodeImage}
        style={{ width:100 }}
      />
    )}
  </div>
</td>

<td>
<button onClick={()=>editItem(i)}>✏</button>
</td>

<td>
<button onClick={()=>deleteItem(i.id)}>🗑</button>
</td>

</tr>
))}
</tbody>
</table>

</div>

</div>
);
}
