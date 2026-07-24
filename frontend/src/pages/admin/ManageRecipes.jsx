import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import ImageUploader from '../../components/ImageUploader.jsx';

const EMPTY = {
  title: '', summary: '', cover_image_url: '', dietary_tags: '', is_public: true,
  ingredients_public: '', ingredients_private: '', steps_private: '',
};

export default function ManageRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.get('/recipes/admin/all').then((d) => setRecipes(d.recipes)).catch(() => {});
  }
  useEffect(load, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      title: r.title, summary: r.summary || '', cover_image_url: r.cover_image_url || '',
      dietary_tags: (r.dietary_tags || []).join(', '), is_public: r.is_public,
      ingredients_public: r.ingredients_public || '', ingredients_private: r.ingredients_private || '',
      steps_private: r.steps_private || '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, dietary_tags: form.dietary_tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (editingId) await api.put(`/recipes/${editingId}`, payload);
      else await api.post('/recipes', payload);
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this recipe?')) return;
    await api.del(`/recipes/${id}`);
    load();
  }

  return (
    <div>
      <h2>Manage Recipes</h2>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 20, borderRadius: 10, marginBottom: 30, maxWidth: 560 }}>
        <h3>{editingId ? 'Edit Recipe' : 'Add Recipe'}</h3>
        {error && <p className="error-msg">{error}</p>}
        <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => update('title', e.target.value)} /></div>
        <div className="field"><label>Public Summary</label><textarea value={form.summary} onChange={(e) => update('summary', e.target.value)} /></div>
        <ImageUploader value={form.cover_image_url} onChange={(url) => update('cover_image_url', url)} label="Cover Image" />
        <div className="field"><label>Dietary Tags</label><input value={form.dietary_tags} onChange={(e) => update('dietary_tags', e.target.value)} placeholder="low-sugar, organic" /></div>
        <div className="field"><label>Public Ingredient List (general, non-secret)</label><textarea value={form.ingredients_public} onChange={(e) => update('ingredients_public', e.target.value)} /></div>
        <hr />
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>🔒 Below fields are private — never shown on the public site.</p>
        <div className="field"><label>Secret Exact Ingredients / Formula</label><textarea value={form.ingredients_private} onChange={(e) => update('ingredients_private', e.target.value)} /></div>
        <div className="field"><label>Secret Preparation Method</label><textarea value={form.steps_private} onChange={(e) => update('steps_private', e.target.value)} /></div>
        <div className="field">
          <label><input type="checkbox" checked={form.is_public} onChange={(e) => update('is_public', e.target.checked)} /> Published (visible to public)</label>
        </div>
        <button className="btn" type="submit">{editingId ? 'Update' : 'Add'} Recipe</button>
        {editingId && <button type="button" className="btn btn-outline" style={{ marginLeft: 10 }} onClick={resetForm}>Cancel</button>}
      </form>

      <table>
        <thead><tr><th>Title</th><th>Public</th><th>Actions</th></tr></thead>
        <tbody>
          {recipes.map((r) => (
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.is_public ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn btn-sm btn-outline" onClick={() => startEdit(r)}>Edit</button>{' '}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
