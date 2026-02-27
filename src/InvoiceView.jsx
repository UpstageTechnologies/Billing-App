import React from "react";
import "./InvoicePrint.css";

export default function InvoiceView({ bill, shopName, shopLogo, onClose }) 

{  if (!bill) return null;

const date = bill.createdAt
  ? new Date(bill.createdAt.seconds * 1000)
  : new Date();
  return (
<div className="invoice-overlay">
<div id="invoice-print" className="invoice-print-container">
    {/* HEADER */}
 <div style={{ textAlign: "center", marginBottom: "10px" }}>
  {shopLogo && (
    <img
      src={shopLogo}
      alt="logo"
      style={{ width: "60px", height: "60px", objectFit: "contain" }}
    />
  )}

  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
    {shopName}
  </div>

  <div style={{ fontSize: "12px" }}>
    Bill No : {bill.billNo}
  </div>
</div>

    <hr />

    <div className="invoice-meta">
      <div>Date: {date.toLocaleDateString()}</div>
      <div>Time: {date.toLocaleTimeString()}</div>
    </div>

<div className="bill-header print-only">
  <span>Item</span>
  <span>Qty</span>
  <span>Price</span>
  <span>GST%</span>
  <span>Total</span>
</div>

{bill.items?.map((it, i) => (
  <div key={i} className="bill-item print-only">
    <span>{it.itemName}</span>
    <span className="col-qty">{it.qty}</span>
    <span className="col-price">₹{it.price}</span>
    <span className="col-gst">{it.gst || 0}%</span>
    <span className="col-total">
      ₹{(it.price * it.qty) + (it.price * it.qty * ((it.gst || 0) / 100))}
    </span>
  </div>
))}

    <h3 className="invoice-total">
      Grand Total: ₹{bill.total}
    </h3>

    <div className="invoice-footer">
      <p>🙏 Visit Again!</p>
    </div>

    <div className="invoice-buttons">
      <button onClick={() => window.print()}>🖨 Print</button>
      <button onClick={onClose}> Close</button>
    </div>

  </div>
</div>
  );
}
