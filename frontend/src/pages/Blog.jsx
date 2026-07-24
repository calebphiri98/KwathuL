import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveImageUrl } from '../api.js';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get(`/blog?page=${page}`)
      .then((d) => {
        setPosts((prev) => (page === 1 ? d.posts : [...prev, ...d.posts]));
        setTotalPages(d.totalPages);
      })
      .catch(() => {});
  }, [page]);

  return (
    <section className="container">
      <h2 className="section-title">Blog & Plant Guides</h2>
      <p className="section-sub">Nutrition tips, plant guides, and stories from the farm.</p>
      <div className="grid">
        {posts.map((p) => (
          <Link to={`/blog/${p.slug}`} className="card" key={p.id}>
            <img src={p.cover_image_url ? resolveImageUrl(p.cover_image_url) : 'https://placehold.co/400x260?text=Kwathu+Blog'} alt={p.title} />
            <div className="card-body">
              <span className="tag">{p.category}</span>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </div>
          </Link>
        ))}
        {posts.length === 0 && <p>No posts published yet.</p>}
      </div>
      {page < totalPages && (
        <p style={{ textAlign: 'center' }}>
          <button className="btn btn-outline" onClick={() => setPage((p) => p + 1)}>Load More</button>
        </p>
      )}
    </section>
  );
}
