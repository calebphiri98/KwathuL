import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import ImageUploader from '../../components/ImageUploader.jsx';
import './Admin.css';

const EMPTY = { name: '', description: '', price: '', category: '', image_url: '', is_organic: false, dietary_tags: '', is_available: true };

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.get('/products/admin/all').then((d) => setProducts(d.products)).catch(() => {});
  }
  useEffect(load, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || '', price: p.price, category: p.category || '',
      image_url: p.image_url || '', is_organic: p.is_organic, dietary_tags: (p.dietary_tags || []).join(', '),
      is_available: p.is_available,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      dietary_tags: form.dietary_tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await api.del(`/products/${id}`);
    load();
  }

  return (
    <div>
      <h2>Manage Products</h2>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
        {error && <p className="error-msg">{error}</p>}
        <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
        <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></div>
        <div className="field"><label>Price (MWK)</label><input type="number" required value={form.price} onChange={(e) => update('price', e.target.value)} /></div>
        <div className="field"><label>Category</label><input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="e.g. Diabetic-Friendly" /></div>
        <ImageUploader value={form.image_url} onChange={(url) => update('image_url', url)} label="Product Image" />
        <div className="field"><label>Dietary Tags (comma separated)</label><input value={form.dietary_tags} onChange={(e) => update('dietary_tags', e.target.value)} placeholder="low-sugar, ulcer-friendly" /></div>
        <div className="field">
          <label><input type="checkbox" checked={form.is_organic} onChange={(e) => update('is_organic', e.target.checked)} /> Organic</label>
        </div>
        <div className="field">
          <label><input type="checkbox" checked={form.is_available} onChange={(e) => update('is_available', e.target.checked)} /> Available</label>
        </div>
        <div className="admin-form-actions">
          <button className="btn" type="submit">{editingId ? 'Update' : 'Add'} Product</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>MWK {Number(p.price).toLocaleString()}</td>
              <td>{p.is_available ? 'Yes' : 'No'}</td>
              <td>
                <div className="admin-row-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}