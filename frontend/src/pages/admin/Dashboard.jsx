import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import './Admin.css';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, recipes: 0, posts: 0, orders: 0, messages: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/products/admin/all'),
      api.get('/recipes/admin/all'),
      api.get('/blog/admin/all'),
      api.get('/orders/admin/all'),
      api.get('/contact'),
    ]).then(([products, recipes, posts, orders, messages]) => {
      setStats({
        products: products.products.length,
        recipes: recipes.recipes.length,
        posts: posts.posts.length,
        orders: orders.orders.length,
        messages: messages.messages.filter((m) => !m.is_read).length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Products', value: stats.products },
    { label: 'Recipes', value: stats.recipes },
    { label: 'Blog Posts', value: stats.posts },
    { label: 'Orders', value: stats.orders },
    { label: 'Unread Messages', value: stats.messages },
  ];

  return (
    <div>
      <h2>Welcome, Admin</h2>
      <div className="grid">
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <div className="card-body">
              <h3 className="admin-stat-value">{c.value}</h3>
              <p>{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}