import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./services/firebase";
import { getDoc, doc } from "firebase/firestore";
import "./MasterOrders.css";

export default function MasterOrders({ setActivePage }) {

  const [orders,setOrders] = useState([]);
  const [shops,setShops] = useState([]);
  const [selectedShop,setSelectedShop] = useState(null);

  useEffect(()=>{

    const unsub = onSnapshot(collection(db,"orders"), async (snap) => {

      const list = snap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }));

      setOrders(list);

const shopMap = {};

for (const o of list) {

  const id = o.shopId || o.shopName;

  if (!shopMap[id]) {

    let logo = o.shopLogo || "";

    // 🔥 If order doesn't contain logo → fetch from users collection
    if (!logo && o.shopId) {

      try {
        const snap = await getDoc(doc(db, "users", o.shopId));

        if (snap.exists()) {
          logo = snap.data().shopLogo || "";
        }

      } catch (err) {
        console.log("Logo fetch error", err);
      }

    }

    shopMap[id] = {
      id: id,
      name: o.shopName || "Shop",
      logo: logo
    };

  }

}

      setShops(Object.values(shopMap));

    });

    return ()=>unsub();

  },[]);


  if(selectedShop){

    const shopOrders = orders.filter(o =>(o.shopId === selectedShop) ||(o.shopName === selectedShop));

    return(
      <div className="master-orders">

      <button onClick={()=>setSelectedShop(null)}>
      ⬅ Back
      </button>

      <h2>Orders</h2>

      <table className="orders-table">

   <thead>
        <tr>
        <th>Order #</th>
        <th>Customer</th>
        <th>Address</th>
        <th>Products</th>
        <th>Total</th>
        <th>Status</th>
        <th>Payment</th>
        <th>Date</th>
        <th>Time</th>
        </tr>
 </thead>

<tbody>

{shopOrders.map((o,index)=>{

const firstItem = o.items?.[0];

return(

<tr key={o.id}>

<td>#{index+1}</td>

<td>{o.customerName}</td>

<td>{o.customerAddress}</td>

<td>

<div>
{firstItem?.itemName} × {firstItem?.qty}

{o.items?.length > 1 && (
<span style={{color:"#2563eb",marginLeft:6}}>
+{o.items.length - 1} more
</span>
)}

</div>

</td>

<td style={{color:"#16a34a",fontWeight:600}}>
₹{o.total}
</td>

<td>
<span className={`table-status ${o.status}`}>
{o.status}
</span>
</td>

<td>
<span className={`payment ${o.paymentStatus || "unpaid"}`}>
{o.paymentStatus || "unpaid"}
</span>
</td>

<td>{o.orderDate}</td>

<td>{o.orderTime}</td>

</tr>

)

})}

</tbody>

      </table>

      </div>
    );
  }


  return(
    <div className="master-orders">

    <button onClick={()=>setActivePage("home")}>
    ⬅ Back
    </button>

    <h2>All Shops Orders</h2>

    <div className="shop-grid">

    {shops.map(s=>(
    <div
      key={s.id}
      className="shop-card"
      onClick={()=>setSelectedShop(s.id)}
    >

<img
  src={s.logo}
  className="shop-img"
/>

      <h4>{s.name}</h4>

    </div>
    ))}

    </div>

    </div>
  );

}