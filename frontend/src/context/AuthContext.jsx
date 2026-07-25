import { createContext, useContext, useEffect, useState } from 'react';
import { api, setCsrfToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const { csrfToken } = await api.get('/auth/csrf-token');
        setCsrfToken(csrfToken);
      } catch (err) {
        console.error('Failed to fetch CSRF token', err);
      }
      await refreshUser();
    }
    init();
  }, []);

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api.post('/auth/register', payload);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}