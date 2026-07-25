import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import './Admin.css';

const STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];

// Converts a locally-formatted number (e.g. "0991234567") into the
// international format WhatsApp's click-to-chat link requires.
// Assumes Malawi (+265) since that's this project's target market.
function toWhatsAppLink(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `265${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

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

  async function deleteOrder(id) {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    await api.del(`/orders/${id}`);
    load();
  }

  return (
    <div>
      <h2>Manage Orders</h2>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Placed</th>
              <th>Update</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const waLink = toWhatsAppLink(o.customer_phone);
              return (
                <tr key={o.id}>
                  <td>
                    {o.customer_name}
                    <br />
                    {waLink ? (
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="muted-text">
                        {o.customer_phone} (WhatsApp)
                      </a>
                    ) : (
                      <small className="muted-text">No phone on file</small>
                    )}
                  </td>
                  <td>MWK {Number(o.total).toLocaleString()}</td>
                  <td>{o.status}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(o.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}