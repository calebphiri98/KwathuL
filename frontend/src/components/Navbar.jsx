import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          Kwathu Foods
          <small>Better Food – Better Living</small>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/menu" onClick={closeMenu}>Menu</Link>
          <Link to="/recipes" onClick={closeMenu}>Recipes</Link>
          <Link to="/blog" onClick={closeMenu}>Blog</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
          {user?.role === 'admin' && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
          {user ? (
            <>
              <Link to="/orders" onClick={closeMenu}>My Orders</Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="btn btn-sm" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}