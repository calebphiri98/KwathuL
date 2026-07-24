import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : '')}>Products</NavLink>
        <NavLink to="/admin/recipes" className={({ isActive }) => (isActive ? 'active' : '')}>Recipes</NavLink>
        <NavLink to="/admin/blog" className={({ isActive }) => (isActive ? 'active' : '')}>Blog Posts</NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>Orders</NavLink>
        <NavLink to="/admin/messages" className={({ isActive }) => (isActive ? 'active' : '')}>Messages</NavLink>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
