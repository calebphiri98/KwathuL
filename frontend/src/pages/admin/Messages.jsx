import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function Messages() {
  const [messages, setMessages] = useState([]);

  function load() {
    api.get('/contact').then((d) => setMessages(d.messages)).catch(() => {});
  }
  useEffect(load, []);

  async function markRead(id) {
    await api.put(`/contact/${id}/read`);
    load();
  }

  return (
    <div>
      <h2>Contact Messages</h2>
      <table>
        <thead><tr><th>From</th><th>Subject</th><th>Message</th><th>Date</th><th></th></tr></thead>
        <tbody>
          {messages.map((m) => (
            <tr key={m.id} style={{ background: m.is_read ? 'white' : 'var(--green-light)' }}>
              <td>{m.name}<br /><small style={{ color: 'var(--muted)' }}>{m.email}</small></td>
              <td>{m.subject}</td>
              <td>{m.message}</td>
              <td>{new Date(m.created_at).toLocaleDateString()}</td>
              <td>{!m.is_read && <button className="btn btn-sm" onClick={() => markRead(m.id)}>Mark Read</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
