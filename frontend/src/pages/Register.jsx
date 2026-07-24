import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', dietary_notes: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="form-page">
      <h2>Create Account</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Full Name</label>
          <input required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="field">
          <label>Password (min 8 characters)</label>
          <input type="password" required minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>
        <div className="field">
          <label>Phone (optional)</label>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div className="field">
          <label>Dietary Notes (optional)</label>
          <input placeholder="e.g. diabetic, low-salt" value={form.dietary_notes} onChange={(e) => update('dietary_notes', e.target.value)} />
        </div>
        <button className="btn" type="submit" style={{ width: '100%' }}>Sign Up</button>
      </form>
      <p style={{ marginTop: 14, fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
