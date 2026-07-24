import { useState } from 'react';
import { uploadImage, resolveImageUrl } from '../api.js';

// Controlled component: `value` is the stored path (e.g. "/uploads/xxx.jpg"),
// `onChange(path)` is called with the new path once upload succeeds.
export default function ImageUploader({ value, onChange, label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      {value && (
        <img
          src={resolveImageUrl(value)}
          alt="Preview"
          style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
        />
      )}
      <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleFile} />
      {uploading && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Uploading…</span>}
      {error && <span className="error-msg">{error}</span>}
      <input
        type="text"
        placeholder="…or paste an image URL"
        value={value?.startsWith('/uploads') ? '' : value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
