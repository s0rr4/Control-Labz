import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('utr_user_token');
        const savedUser = await SecureStore.getItemAsync('utr_user');
        if (!savedToken) {
          setLoading(false);
          return;
        }
        if (process.env.EXPO_PUBLIC_DEMO_AUTH === 'true' && savedToken === 'demo-admin-token') {
          setUser(savedUser ? JSON.parse(savedUser) : { id: 1, nombre: 'Administrador Demo', rol: 'ADMIN' });
          setLoading(false);
          return;
        }
        const verified = await authApi.verify();
        setUser(verified);
        await SecureStore.setItemAsync('utr_user', JSON.stringify(verified));
      } catch {
        await SecureStore.deleteItemAsync('utr_user_token');
        await SecureStore.deleteItemAsync('utr_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSession = async (result) => {
    await SecureStore.setItemAsync('utr_user_token', result.token);
    await SecureStore.setItemAsync('utr_user', JSON.stringify(result.user));
    setUser(result.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    await SecureStore.deleteItemAsync('utr_user_token');
    await SecureStore.deleteItemAsync('utr_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, saveSession, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
