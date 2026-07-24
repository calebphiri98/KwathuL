import { useEffect, useState } from 'react';
import { api, resolveImageUrl } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addItem, items } = useCart();

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    api.get(`/products?${params.toString()}`)
      .then((d) => {
        setProducts((prev) => (page === 1 ? d.products : [...prev, ...d.products]));
        setTotalPages(d.totalPages);
      })
      .catch(() => {});
  }, [search, page]);

  return (
    <section>
      <h2 className="section-title">Our Menu</h2>
      <p className="section-sub">Nutrition-conscious meals prepared with care.</p>

      <div style={{ maxWidth: 400, margin: '0 auto 20px' }}>
        <input
          className="field"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          placeholder="Search meals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {items.length > 0 && (
        <p style={{ textAlign: 'center' }}>
          <Link to="/cart" className="btn btn-sm">View Cart ({items.length})</Link>
        </p>
      )}

      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p.id}>
            <img src={p.image_url ? resolveImageUrl(p.image_url) : 'https://placehold.co/400x260?text=Kwathu+Foods'} alt={p.name} />
            <div className="card-body">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div>
                {p.is_organic && <span className="tag">Organic</span>}
                {p.dietary_tags?.map((t) => <span className="tag" key={t}>{t}</span>)}
              </div>
              <span className="price">MWK {Number(p.price).toLocaleString()}</span>
              <button className="btn btn-sm" onClick={() => addItem(p)}>Add to Cart</button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p>No meals found.</p>}
      </div>
      {page < totalPages && (
        <p style={{ textAlign: 'center' }}>
          <button className="btn btn-outline" onClick={() => setPage((p) => p + 1)}>Load More</button>
        </p>
      )}
    </section>
  );
}
