import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "./services/firebase";
import "./ShopMenu.css";

export default function ShopMenu() {

  const { shopId } = useParams();
  const navigate = useNavigate();

 const [items, setItems] = useState([]);
const [shopName, setShopName] = useState("");
const [grouped, setGrouped] = useState({});



  // 🔥 cart state
  const [cartState, setCartState] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const [showMiniCart, setShowMiniCart] = useState(false);

  /* LOAD INVENTORY */
useEffect(() => {
 if (!shopId) return;

 const loadShop = async()=>{
 const shopRef = doc(db,"users",shopId,"settings","shopProfile");
   const shopSnap = await getDoc(shopRef);
   if(shopSnap.exists()){
     setShopName(
       shopSnap.data().shopName || shopSnap.data().name || "Shop"
     );
   }
 };
 loadShop();

 const ref = collection(db, "users", shopId, "inventory");

const unsub = onSnapshot(ref, (snap) => {

  const list = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  setItems(list);

  // 🔥 group by category
  const temp = {};
  list.forEach(p=>{
    if(!temp[p.category]) temp[p.category]=[];
    temp[p.category].push(p);
  });

  setGrouped(temp);
});


 return ()=>unsub();

},[shopId]);


  /* SYNC CART */
  useEffect(() => {
    const sync = () => {
      setCartState(JSON.parse(localStorage.getItem("cart")) || []);
    };

    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  /* ✅ ADD TO CART */
  const addToCart = (item) => {

    const updated = [...cartState];

    const exist = updated.find(c => c.id === item.id);

    if (exist) {
      exist.qty += 1;
    } else {
      updated.push({
  id: item.id,
  itemName: item.itemName,
  price: Number(item.price),
  image: item.image,
  shopName: shopName,
  qty: 1
});

    }

    setCartState(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    window.dispatchEvent(new Event("cartUpdated"));

    setShowMiniCart(true);   // 🔥 show popup
  };

  return (
    <div className="shopmenu">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>
      <br></br><br></br><br></br>

      
      <h2>Shop Products</h2>

   {Object.keys(grouped).map(cat=>(
  <div key={cat}>

    <h3 style={{margin:"20px 0 10px"}}>
      {cat}
    </h3>

    <div className="product-list">

      {grouped[cat].map(i=>(

        <div key={i.id} className="product-card">

          {i.image && <img src={i.image} alt={i.itemName} />}

          <h4>{i.itemName}</h4>
          <p>₹{i.price}</p>
          <span>Stock: {i.quantity}</span>

          <button
            className="cart-btn"
            onClick={() => addToCart(i)}
          >
            Add Cart
            {cartState.find(c => c.id === i.id)?.qty > 0 && (
              <span className="badge">
                {cartState.find(c => c.id === i.id)?.qty}
              </span>
            )}
          </button>

        </div>

      ))}

    </div>

  </div>
))}


{/* ================= MINI CART POPUP ================= */}

{showMiniCart && cartState.length > 0 && (
  <div
    className="mini-cart-icon-only"
    onClick={() => navigate("/cart")}
  >
    🛒
    <span className="mini-count">
      {cartState.reduce((s,i)=>s+i.qty,0)}
    </span>
  </div>
)}


{/* ==================================================== */}

    </div>
  );
}
