import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";

export default function CategoryProducts(){

  const { name } = useParams();
  const [products,setProducts] = useState([]);

  useEffect(()=>{
    const load = async()=>{
      const snap = await getDocs(collection(db,"public_shops"));
      let all=[];

      for(const shop of snap.docs){
        const inv = await getDocs(
          collection(db,"users",shop.id,"inventory")
        );

        inv.forEach(p=>{
          if(p.data().category === name){
            all.push({
              id:p.id,
              shopId:shop.id,
              ...p.data()
            });
          }
        });
      }

      setProducts(all);
    };

    load();
  },[name]);

  return(
    <div style={{padding:20}}>

      <h2>{name}</h2>

      <div className="shop-list">
        {products.map(p=>(
          <div key={p.id} className="shop-card">

            <img
              src={p.image}
              className="shop-img-top"
            />

            <div className="shop-info">
              <h4>{p.itemName}</h4>
              <p>₹{p.price}</p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
