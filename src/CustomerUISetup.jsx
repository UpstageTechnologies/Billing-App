import React, { useState, useEffect } from "react";
import { db } from "./services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function CustomerUISetup({ setActivePage }) {

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState({
    Groceries:"",
    Snacks:"",
    Drinks:"",
    Household:""
  });

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db,"settings","customerUI"));
      if(snap.exists()){
        setBanners(snap.data().banners || []);
        setCategories(snap.data().categories || {});
      }
    };
    load();
  }, []);

  const uploadBanner = (file) => {
    if(!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const updated = [...banners, reader.result];

      await setDoc(
        doc(db,"settings","customerUI"),
        { banners: updated },
        { merge:true }
      );

      setBanners(updated);
    };
    reader.readAsDataURL(file);
  };

  const deleteBanner = async (index) => {

  const updated = banners.filter((_, i) => i !== index);

  await setDoc(
    doc(db,"settings","customerUI"),
    { banners: updated },
    { merge:true }
  );

  setBanners(updated);
};


  const uploadCategory = (file, key) => {
    if(!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {

      const updated = {
        ...categories,
        [key]: reader.result
      };

      await setDoc(
        doc(db,"settings","customerUI"),
        { categories: updated },
        { merge:true }
      );

      setCategories(updated);
    };
    reader.readAsDataURL(file);
  };

  const deleteCategoryImage = async (key) => {

  const updated = {
    ...categories,
    [key]: ""
  };

  await setDoc(
    doc(db,"settings","customerUI"),
    { categories: updated },
    { merge:true }
  );

  setCategories(updated);
};


  return (
    <div className="customer-ui-wrapper">

      <button onClick={()=>setActivePage("home")}>
        ⬅ Back
      </button>

      <h2>Customer Dashboard Setup</h2>

      {/* BANNERS */}
      <h3>Banner Slider Images</h3>

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>

     {banners.map((b,i)=>(
  <div key={i} style={{position:"relative"}}>

    <img
      src={b}
      style={{
        width:160,
        height:90,
        objectFit:"cover",
        borderRadius:10
      }}
    />

    <span
      onClick={()=>deleteBanner(i)}
      style={{
        position:"absolute",
        top:-6,
        right:-6,
        background:"red",
        color:"white",
        borderRadius:"50%",
        width:22,
        height:22,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        cursor:"pointer",
        fontSize:14
      }}
    >
      ✕
    </span>

  </div>
))}


        <label style={{
          width:160,
          height:90,
          border:"2px dashed gray",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          borderRadius:10,
          cursor:"pointer"
        }}>
          ➕ Add
          <input
            type="file"
            hidden
            onChange={e=>uploadBanner(e.target.files[0])}
          />
        </label>

      </div>

      {/* CATEGORIES */}
      <h3>Categories</h3>

      <div style={{display:"flex",gap:20}}>

   {Object.keys(categories).map(c=>(
  <div key={c}>

    <p>{c}</p>

    <div style={{ position:"relative" }}>

      {/* CLICKABLE LABEL */}
      <label htmlFor={`file-${c}`}>

        <img
          src={categories[c] || "https://via.placeholder.com/100"}
          style={{
            width:100,
            height:100,
            objectFit:"cover",
            borderRadius:10,
            cursor:"pointer"
          }}
        />

      </label>

      {/* DELETE BUTTON */}
      {categories[c] && (
        <span
          onClick={()=>deleteCategoryImage(c)}
          style={{
            position:"absolute",
            top:-6,
            right:-6,
            background:"red",
            color:"white",
            borderRadius:"50%",
            width:20,
            height:20,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:12,
            cursor:"pointer"
          }}
        >
          ✕
        </span>
      )}

      {/* REAL FILE INPUT */}
      <input
        id={`file-${c}`}
        type="file"
        hidden
        onChange={e=>uploadCategory(e.target.files[0],c)}
      />

    </div>

  </div>
))}


      </div>

    </div>
  );
}
