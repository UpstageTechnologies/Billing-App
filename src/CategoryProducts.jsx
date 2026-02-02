import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./services/firebase";
import "./CategoryProducts.css";

export default function CategoryProducts(){

  const { name } = useParams();
  const [grouped,setGrouped] = useState({});

  useEffect(()=>{
    const load = async()=>{

      const shopSnap = await getDocs(collection(db,"public_shops"));
      let temp = {};

      for(const shop of shopSnap.docs){

        const shopData = shop.data();

        const invSnap = await getDocs(
          collection(db,"users",shop.id,"inventory")
        );

        invSnap.forEach(p=>{
          if(p.data().category === name){

            if(!temp[shopData.name]){
              temp[shopData.name] = [];
            }

            temp[shopData.name].push({
              id:p.id,
              shopId:shop.id,
              ...p.data()
            });

          }
        });

      }

      setGrouped(temp);
    };

    load();
  },[name]);

  return(
    <div className="category-page">

      <h2>{name}</h2>

      {Object.keys(grouped).length === 0 && (
        <p className="empty-msg">No products found</p>
      )}

      {Object.keys(grouped).map(shopName => (

        <div key={shopName}>

          <h3 className="shop-title">{shopName}</h3>

          <div className="shop-list">

            {grouped[shopName].map(p => (

              <div key={p.id} className="shop-card">

                <img src={p.image} className="shop-img-top"/>

                <div className="shop-info">
                  <h4>{p.itemName}</h4>
                  <p>₹{p.price}</p>
                </div>

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>
  );
}
