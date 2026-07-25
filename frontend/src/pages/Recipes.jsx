import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveImageUrl } from '../api.js';
import './Recipes.css';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get(`/recipes?page=${page}`)
      .then((d) => {
        setRecipes((prev) => (page === 1 ? d.recipes : [...prev, ...d.recipes]));
        setTotalPages(d.totalPages);
      })
      .catch(() => {});
  }, [page]);

  return (
    <section className="container">
      <h2 className="section-title">Recipes</h2>
      <p className="section-sub">A taste of what we make: the full method stays in our kitchen.</p>
      <div className="grid">
        {recipes.map((r) => (
          <Link to={`/recipes/${r.slug}`} className="card tap-card recipe-card" key={r.id}>
            <img src={r.cover_image_url ? resolveImageUrl(r.cover_image_url) : 'https://placehold.co/400x260?text=Recipe'} alt={r.title} />
            <div className="card-body">
              <h3>{r.title}</h3>
              <p>{r.summary}</p>
              <div>{r.dietary_tags?.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            </div>
          </Link>
        ))}
        {recipes.length === 0 && <p className="empty-state">No recipes published yet.</p>}
      </div>
      {page < totalPages && (
        <p className="text-center">
          <button className="btn btn-outline" onClick={() => setPage((p) => p + 1)}>Load More</button>
        </p>
      )}
    </section>
  );
}