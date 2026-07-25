import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, resolveImageUrl } from '../api.js';
import './BlogDetail.css';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/blog/${slug}`).then((d) => setPost(d.post)).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="detail-status">{error}</p>;
  if (!post) return <p className="detail-status">Loading…</p>;

  return (
    <section className="container blog-detail">
      <img
        src={post.cover_image_url ? resolveImageUrl(post.cover_image_url) : 'https://placehold.co/700x300?text=Kwathu+Blog'}
        alt={post.title}
        className="blog-detail-cover"
      />
      <span className="tag">{post.category}</span>
      <h1>{post.title}</h1>
      <p className="blog-detail-meta">
        By {post.author_name || 'Kwathu Foods'} · {new Date(post.published_at).toLocaleDateString()}
      </p>
      <div className="blog-detail-content">{post.content}</div>
    </section>
  );
}