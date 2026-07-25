import { useEffect, useState } from 'react';
import { api } from '../api.js';
import './Orders.css';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/mine').then((d) => setOrders(d.orders)).catch(() => {});
  }, []);

  return (
    <section className="container">
      <h2 className="section-title">My Orders</h2>
      {orders.length === 0 && <p className="empty-state">You haven't placed any orders yet.</p>}

      {orders.map((o) => (
        <div className="card order-card" key={o.id}>
          <div className="card-body">
            <div className="order-header">
              <strong>Order #{o.id.slice(0, 8)}</strong>
              <span className="badge">{STATUS_LABELS[o.status] || o.status}</span>
            </div>
            <p className="muted-text">
              {new Date(o.created_at).toLocaleString()}
            </p>
            <ul className="order-items-list">
              {o.items.map((it) => (
                <li key={it.id}>{it.product_name} × {it.quantity} — MWK {Number(it.line_total).toLocaleString()}</li>
              ))}
            </ul>
            <strong>Total: MWK {Number(o.total).toLocaleString()}</strong>
          </div>
        </div>
      ))}
    </section>
  );
}