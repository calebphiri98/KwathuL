import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveImageUrl } from '../api.js';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products').then((d) => setProducts(d.products.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      <div className="hero">
        <h1>Better Food – Better Living</h1>
        <p>
          Kwathu means "our home." We grow, prepare, and deliver nutrition-conscious meals —
          from diabetic-friendly dishes to organic, farm-fresh favourites — because healthy
          eating should feel like home.
        </p>
        <Link to="/menu" className="btn">Browse the Menu</Link>
      </div>

      <section>
        <h2 className="section-title">Featured Meals</h2>
        <p className="section-sub">Fresh from our farm-to-kitchen kitchen, prepared with your health in mind.</p>
        <div className="grid">
          {products.map((p) => (
            <div className="card" key={p.id}>
              <img src={p.image_url ? resolveImageUrl(p.image_url) : 'https://placehold.co/400x260?text=Kwathu+Foods'} alt={p.name} />
              <div className="card-body">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div>{p.dietary_tags?.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                <span className="price">MWK {Number(p.price).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="empty-state">Meals coming soon.</p>}
        </div>
      </section>

      <section className="home-why-section">
        <h2 className="section-title">Why Kwathu?</h2>
        <div className="grid">
          <div className="card"><div className="card-body"><h3>Organic Farming</h3><p>Ingredients grown with care, from farm to kitchen.</p></div></div>
          <div className="card"><div className="card-body"><h3>Dietary-Aware Meals</h3><p>Diabetic, low-sugar, low-salt, ulcer-friendly and more.</p></div></div>
          <div className="card"><div className="card-body"><h3>Trusted & Local</h3><p>A wellness food brand built for our community.</p></div></div>
        </div>
      </section>
    </div>
  );
}