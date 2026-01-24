import React, { useEffect, useState } from "react";
import { db } from "./services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function EmployeeList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "employees"), (snap) => {
      setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);
  return (
    <div className="content-card">
      <h3>👨‍💼 Employees</h3>
      {list.map((e) => (
        <div key={e.id}>
          {e.name} | {e.phone}
        </div>
      ))}
    </div>
  );
}
