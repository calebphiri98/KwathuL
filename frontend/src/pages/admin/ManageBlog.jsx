import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import ImageUploader from '../../components/ImageUploader.jsx';

const EMPTY = { title: '', excerpt: '', content: '', cover_image_url: '', category: 'General', tags: '', is_published: true };

export default function ManageBlog() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.get('/blog/admin/all').then((d) => setPosts(d.posts)).catch(() => {});
  }
  useEffect(load, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      title: p.title, excerpt: p.excerpt || '', content: p.content, cover_image_url: p.cover_image_url || '',
      category: p.category || 'General', tags: (p.tags || []).join(', '), is_published: p.is_published,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (editingId) await api.put(`/blog/${editingId}`, payload);
      else await api.post('/blog', payload);
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post?')) return;
    await api.del(`/blog/${id}`);
    load();
  }

  return (
    <div>
      <h2>Manage Blog & Plant Guides</h2>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 20, borderRadius: 10, marginBottom: 30, maxWidth: 560 }}>
        <h3>{editingId ? 'Edit Post' : 'Add Post'}</h3>
        {error && <p className="error-msg">{error}</p>}
        <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => update('title', e.target.value)} /></div>
        <div className="field"><label>Category</label>
          <select value={form.category} onChange={(e) => update('category', e.target.value)}>
            <option>General</option><option>Nutrition</option><option>Plant Guide</option><option>Farm Update</option><option>Recipes & Tips</option>
          </select>
        </div>
        <div className="field"><label>Excerpt</label><textarea value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} /></div>
        <div className="field"><label>Content</label><textarea rows={8} required value={form.content} onChange={(e) => update('content', e.target.value)} /></div>
        <ImageUploader value={form.cover_image_url} onChange={(url) => update('cover_image_url', url)} label="Cover Image" />
        <div className="field"><label>Tags (comma separated)</label><input value={form.tags} onChange={(e) => update('tags', e.target.value)} /></div>
        <div className="field">
          <label><input type="checkbox" checked={form.is_published} onChange={(e) => update('is_published', e.target.checked)} /> Published</label>
        </div>
        <button className="btn" type="submit">{editingId ? 'Update' : 'Add'} Post</button>
        {editingId && <button type="button" className="btn btn-outline" style={{ marginLeft: 10 }} onClick={resetForm}>Cancel</button>}
      </form>

      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Published</th><th>Actions</th></tr></thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.category}</td>
              <td>{p.is_published ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn btn-sm btn-outline" onClick={() => startEdit(p)}>Edit</button>{' '}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
