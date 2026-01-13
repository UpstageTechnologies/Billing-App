import React from "react";
import "./InvoicePrint.css";

export default function InvoiceView({ bill, onClose }) {
  if (!bill) return null;

  const date = bill.createdAt?.toDate?.() || new Date();

  return (
    <div className="invoice-overlay">
      <div className="invoice-box" id="invoice-print">

        <h2>🛒 My Super Store</h2>
        <p>GSTIN: 29ABCDE1234F1Z5</p>
        <hr/>

        <div className="invoice-meta">
          <div>Invoice Date: {date.toLocaleDateString()}</div>
          <div>Time: {date.toLocaleTimeString()}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((it, i) => (
              <tr key={i}>
                <td>{it.itemName}</td>
                <td>{it.qty}</td>
                <td>₹{it.price}</td>
                <td>₹{it.price * it.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="invoice-total">Grand Total: ₹{bill.total}</h3>

        <div className="invoice-buttons">
          <button onClick={() => window.print()}>🖨 Print</button>
          <button onClick={onClose}>❌ Close</button>
        </div>

      </div>
    </div>
  );
}
