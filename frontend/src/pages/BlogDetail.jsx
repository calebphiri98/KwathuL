import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, resolveImageUrl } from '../api.js';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/blog/${slug}`).then((d) => setPost(d.post)).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p style={{ textAlign: 'center', padding: 40 }}>{error}</p>;
  if (!post) return <p style={{ textAlign: 'center', padding: 40 }}>Loading…</p>;

  return (
    <section className="container" style={{ maxWidth: 720 }}>
      <img
        src={post.cover_image_url ? resolveImageUrl(post.cover_image_url) : 'https://placehold.co/700x300?text=Kwathu+Blog'}
        alt={post.title}
        style={{ width: '100%', borderRadius: 12, marginBottom: 20 }}
      />
      <span className="tag">{post.category}</span>
      <h1>{post.title}</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
        By {post.author_name || 'Kwathu Foods'} · {new Date(post.published_at).toLocaleDateString()}
      </p>
      <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{post.content}</div>
    </section>
  );
}
