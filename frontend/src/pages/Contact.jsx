import { useState } from 'react';
import { api } from '../api.js';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    try {
      const res = await api.post('/contact', form);
      setStatus(res.message);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="form-page">
      <h2>Contact Us</h2>
      {status && <p className="success-msg">{status}</p>}
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Name</label>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="field">
          <label>Subject</label>
          <input value={form.subject} onChange={(e) => update('subject', e.target.value)} />
        </div>
        <div className="field">
          <label>Message</label>
          <textarea required rows={5} className="contact-message-input" value={form.message} onChange={(e) => update('message', e.target.value)} />
        </div>
        <button className="btn" type="submit">Send Message</button>
      </form>
    </div>
  );
}