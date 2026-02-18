import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";
import "./MasterAnalytics.css";

export default function MasterAnalytics({ setActivePage }) {

  const [shops, setShops] = useState([]);
  const [totalPlatformSales, setTotalPlatformSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadAnalytics = async () => {

      try {

        let platformTotal = 0;
        let shopsData = [];

        const usersSnap = await getDocs(collection(db, "users"));

        for (const userDoc of usersSnap.docs) {

          const userData = userDoc.data();

          if (userData.role === "seller") {

            const salesSnap = await getDocs(
              collection(db, "users", userDoc.id, "sales")
            );

            let shopTotal = 0;
            let orderCount = 0;

            salesSnap.forEach((sale) => {
              shopTotal += sale.data().total || 0;
              orderCount++;
            });

            platformTotal += shopTotal;

            shopsData.push({
              shopId: userDoc.id,
              shopName: userData.name || "Shop",
              totalSales: shopTotal,
              orders: orderCount
            });
          }
        }

        setShops(shopsData);
        setTotalPlatformSales(platformTotal);
        setLoading(false);

      } catch (err) {
        console.log("Analytics error:", err);
        setLoading(false);
      }
    };

    loadAnalytics();

  }, []);

  return (
    <div className="analytics-page">

      <button
        className="back-btn"
        onClick={() => setActivePage("home")}
      >
        ⬅ Back
      </button>

      <h2>📊 Master Analytics</h2>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          <div className="platform-card">
            <h3>Total Platform Sales</h3>
            <h1>₹{totalPlatformSales}</h1>
          </div>

          <div className="shops-analytics">
            {shops.map((shop) => (
              <div className="shop-card" key={shop.shopId}>
                <h4>{shop.shopName}</h4>
                <p>Total Sales: ₹{shop.totalSales}</p>
                <p>Total Orders: {shop.orders}</p>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
