import { useEffect, useState } from 'react';
import { api, resolveImageUrl } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import './Menu.css';

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

      <div className="menu-search-wrap">
        <input
          className="menu-search-input"
          placeholder="Search meals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {items.length > 0 && (
        <p className="menu-cart-link-wrap">
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
              <div className="menu-card-footer">
                <span className="price">MWK {Number(p.price).toLocaleString()}</span>
                <button className="btn btn-sm" onClick={() => addItem(p)}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="empty-state">No meals found.</p>}
      </div>
      {page < totalPages && (
        <p className="text-center">
          <button className="btn btn-outline" onClick={() => setPage((p) => p + 1)}>Load More</button>
        </p>
      )}
    </section>
  );
}