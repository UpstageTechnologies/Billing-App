import React, { useEffect, useState } from "react";
import { db } from "./services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function CustomerList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "customers"), (snap) => {
      setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="content-card">
      <h3>🧑‍🤝‍🧑 Customers</h3>
      {list.map((c) => (
        <div key={c.id}>
          {c.name} | {c.phone}
        </div>
      ))}
    </div>
  );
}
