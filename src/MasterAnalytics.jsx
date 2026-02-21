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
  const [totalPlatformOrders, setTotalPlatformOrders] = useState(0);


useEffect(() => {

  const loadAnalytics = async () => {

    try {

      let platformTotal = 0;
      let platformOrders = 0;
      let shopsData = [];

      const usersSnap = await getDocs(collection(db, "users"));

      for (const userDoc of usersSnap.docs) {

        const userData = userDoc.data();

        if (userData.role === "seller") {

          const salesSnap = await getDocs(
            collection(db, "users", userDoc.id, "sales")
          );

          let shopTotal = 0;
          let orderCount = salesSnap.size;   // ✅ COUNT DIRECTLY

          salesSnap.forEach((sale) => {
            const total = sale.data().total || 0;
            shopTotal += total;
          });

          platformTotal += shopTotal;
          platformOrders += orderCount;

      shopsData.push({
  shopId: userDoc.id,
  shopName: userData.shopName || "No Shop Name",
  shopLogo: userData.shopLogo || "",
  totalSales: shopTotal,
  orders: orderCount
});
        }
      }

      // ✅ Calculate percentage
      shopsData = shopsData.map(shop => ({
        ...shop,
        percent: platformTotal > 0
          ? ((shop.totalSales / platformTotal) * 100).toFixed(1)
          : "0"
      }));

      // ✅ Sort highest first
      shopsData.sort((a, b) => b.totalSales - a.totalSales);

      setShops(shopsData);
      setTotalPlatformSales(platformTotal);
      setTotalPlatformOrders(platformOrders);
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

  <div className="platform-metric">
    <span className="metric-label">Total Sales</span>
    <h1>₹{totalPlatformSales.toFixed(2)}</h1>
  </div>

  <div className="divider-line" />

  <div className="platform-metric">
    <span className="metric-label">Total Orders</span>
    <h1>{totalPlatformOrders}</h1>
  </div>

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

  <div className="shop-left">

  <div className="shop-header">
    <img
      src={
        shop.shopLogo && shop.shopLogo !== ""
          ? shop.shopLogo
          : "https://via.placeholder.com/50"
      }
      className="shop-logo"
      alt="logo"
    />

    <h4>{shop.shopName}</h4>
  </div>

  <p>Total Sales: ₹{shop.totalSales}</p>
  <p>Total Orders: {shop.orders}</p>

</div>

    <div className="shop-right">
      <div
        className="percent-circle"
        style={{
          background: `conic-gradient(#4f46e5 ${shop.percent * 3.6}deg, #e5e7eb 0deg)`
        }}
      >
        <div className="percent-inner">
          {shop.percent}%
        </div>
      </div>
    </div>

  </div>
))}
          </div>
        </>
      )}

    </div>
  );
}
