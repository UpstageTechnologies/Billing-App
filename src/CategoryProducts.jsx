import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";
import "./CategoryProducts.css";

export default function CategoryProducts(){

  const navigate = useNavigate();
  const { name } = useParams();

  const [grouped, setGrouped] = useState({});
  const [search, setSearch] = useState("");

  const [cartState, setCartState] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  

  /* 📦 LOAD PRODUCTS */
  useEffect(()=>{
    const load = async()=>{
      const shopSnap = await getDocs(collection(db,"public_shops"));
      let temp = {};

      for(const shop of shopSnap.docs){
        const invSnap = await getDocs(
          collection(db,"users",shop.id,"inventory")
        );

        invSnap.forEach(p=>{
          if(p.data().category === name){
            if(!temp[shop.data().name]){
              temp[shop.data().name] = [];
            }

         temp[shop.data().name].push({
            ...p.data(),
            id: p.id,
            shopName: shop.data().name,
            shopId: shop.id   // ✅ comma added
          });

          }
        });
      }
      setGrouped(temp);
    };
    load();
  },[name]);

  /* 🔄 CART SYNC */
  useEffect(()=>{
    const syncCart = ()=>{
      setCartState(JSON.parse(localStorage.getItem("cart")) || []);
    };
    window.addEventListener("cartUpdated", syncCart);
    return ()=>window.removeEventListener("cartUpdated", syncCart);
  },[]);

  /* ➕ ADD TO CART */
  const addToCart = (p, shopName)=>{
    const updated = [...cartState];
    const exist = updated.find(i=>i.id===p.id);

    if(exist){
      exist.qty += 1;
    }else{
      updated.push({
        id:p.id,
        itemName:p.itemName,
        price:Number(p.price),
        image:p.image,
        shopName,
        qty:1
      });
    }

    setCartState(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  /* 🧾 GROUP CART BY SHOP */
  const shopCart = {};
  cartState.forEach(i=>{
    if(!shopCart[i.shopName]){
      shopCart[i.shopName] = [];
    }
    shopCart[i.shopName].push(i);
  });

  return(
    <div className="cat-page">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <h2 className="cat-title">{name}</h2>

      <input
        className="cat-search"
        placeholder="Search products..."
        value={search}
        onChange={e=>setSearch(e.target.value)}
      />

      {Object.keys(grouped).map(shopName=>(
        <div key={shopName}>

          <h3 className="cat-shop-title">{shopName}</h3>

          <div className="cat-grid">

            {grouped[shopName]
              .filter(p =>
                p.itemName.toLowerCase().includes(search.toLowerCase())
              )
              .map(p=>(
                <div key={p.id} className="cat-card">

                  <img src={p.image} className="cat-img" />

                  <div className="cat-info">
                    <h4>{p.itemName}</h4>
                    <p>₹{p.price}</p>

                    <button
                      className="cat-add"
                      onClick={()=>addToCart(p, shopName)}
                    >
                      Add

                      {cartState.find(i=>i.id===p.id)?.qty > 0 && (
                        <span className="Cat-badge">
                          {cartState.find(i=>i.id===p.id)?.qty}
                        </span>
                      )}

                    </button>
                  </div>

                </div>
              ))}

          </div>

        </div>
      ))}

{/* ================= FLOATING SHOP CART ICONS ================= */}

<div className="floating-carts">

{Object.keys(shopCart).map(shop => {

  const count =
    shopCart[shop].reduce((s,i)=>s+i.qty,0);

  return(
    <div
      key={shop}
      className="shop-cart-float"
      onClick={()=>navigate(`/shop-cart/${shop}`)}
    >
      🛒
      <span className="float-badge">{count}</span>
      <small>{shop}</small>
    </div>
  );

})}

</div>

{/* ============================================================ */}

    </div>
  );
}
