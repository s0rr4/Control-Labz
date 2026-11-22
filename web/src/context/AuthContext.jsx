import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('utr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('utr_user');
    };
    window.addEventListener('utr:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('utr:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('utr_user_token');
    if (!token) {
      setLoading(false);
      return;
    }
    if (import.meta.env.VITE_DEMO_AUTH === 'true' && token === 'demo-admin-token') {
      setLoading(false);
      return;
    }
    authService.verify()
      .then((verified) => {
        setUser(verified);
        localStorage.setItem('utr_user', JSON.stringify(verified));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (result) => {
    localStorage.setItem('utr_user_token', result.token);
    localStorage.setItem('utr_user', JSON.stringify(result.user));
    setUser(result.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // The local session must be cleared even if the server is unavailable.
    }
    localStorage.removeItem('utr_user_token');
    localStorage.removeItem('utr_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
