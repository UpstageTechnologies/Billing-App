import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";
import "./MasterAnalytics.css";
import {LineChart,Line,ResponsiveContainer,Tooltip,AreaChart,Area} from "recharts";

export default function MasterAnalytics({ setActivePage }) {

  const [shops, setShops] = useState([]);
  const [totalPlatformSales, setTotalPlatformSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [growthPercent, setGrowthPercent] = useState(0);


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

          let salesArray = [];

          salesSnap.forEach((sale) => {
            const total = sale.data().total || 0;
            shopTotal += total;
            orderCount++;
            salesArray.push(total);
          });

          // Simple growth logic (last half vs first half)
          if (salesArray.length > 1) {
            const mid = Math.floor(salesArray.length / 2);

            const firstHalf = salesArray
              .slice(0, mid)
              .reduce((a, b) => a + b, 0);

            const secondHalf = salesArray
              .slice(mid)
              .reduce((a, b) => a + b, 0);

            if (firstHalf > 0) {
              const growth = ((secondHalf - firstHalf) / firstHalf) * 100;
              setGrowthPercent(growth.toFixed(1));
            }
          }


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
{/* 🔥 PROFESSIONAL BUSINESS GROWTH CARD */}
<div className="growth-card-pro">

  <div className="growth-header">
    <div>
      <h3>Business Growth</h3>
      <span>Platform Performance</span>
    </div>

    <div className={`growth-percent ${growthPercent >= 0 ? "up" : "down"}`}>
      {growthPercent >= 0 ? "+" : ""}
      {growthPercent}%
    </div>
  </div>

  <div className="growth-chart">
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart
        data={[
          { value: 400 },
          { value: 800 },
          { value: 1200 },
          { value: 900 },
          { value: 1600 },
          { value: 2200 },
          { value: 3000 },
          { value: totalPlatformSales }
        ]}
      >
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="value"
          stroke="#4f46e5"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorSales)"
        />
        <Tooltip />
      </AreaChart>
    </ResponsiveContainer>
  </div>

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
