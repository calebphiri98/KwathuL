import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  async function placeOrder() {
    if (!user) {
      navigate('/login');
      return;
    }
    setError('');
    setPlacing(true);
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        delivery_address: address,
        delivery_phone: phone,
        notes,
      });
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="container">
      <h2 className="section-title">Your Cart</h2>
      {items.length === 0 && <p style={{ textAlign: 'center' }}>Your cart is empty.</p>}

      {items.map((i) => (
        <div className="cart-item" key={i.product.id}>
          <div>
            <strong>{i.product.name}</strong>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>MWK {Number(i.product.price).toLocaleString()} each</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number"
              min="1"
              value={i.quantity}
              onChange={(e) => updateQuantity(i.product.id, Number(e.target.value))}
              style={{ width: 60, padding: 6, borderRadius: 6, border: '1px solid #ddd' }}
            />
            <button className="btn btn-outline btn-sm" onClick={() => removeItem(i.product.id)}>Remove</button>
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Total: MWK {subtotal.toLocaleString()}</h3>

          <div className="field">
            <label>Delivery Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Area 25, Lilongwe" />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0999 123 456" />
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn" onClick={placeOrder} disabled={placing}>
            {placing ? 'Placing order…' : user ? 'Place Order' : 'Login to Order'}
          </button>
        </div>
      )}
    </section>
  );
}
