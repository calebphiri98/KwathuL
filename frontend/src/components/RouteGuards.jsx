import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 40, textAlign: 'center' }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 40, textAlign: 'center' }}>Loading…</p>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}
