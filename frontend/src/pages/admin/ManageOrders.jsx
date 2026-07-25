import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import './Admin.css';

const STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);

  function load() {
    api.get('/orders/admin/all').then((d) => setOrders(d.orders)).catch(() => {});
  }
  useEffect(load, []);

  async function updateStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <h2>Manage Orders</h2>
      <div className="admin-table-wrap">
      <table>
        <thead><tr><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th><th>Update</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.customer_name}<br /><small className="muted-text">{o.customer_email}</small></td>
              <td>MWK {Number(o.total).toLocaleString()}</td>
              <td>{o.status}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td>
                <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}