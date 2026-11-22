import { httpRequest } from './httpClient';

const DEMO_AUTH = import.meta.env.VITE_DEMO_AUTH === 'true';

function demoLogin(payload) {
  if (DEMO_AUTH && payload.email === 'admin' && payload.password === 'admin123') {
    return {
      token: 'demo-admin-token',
      user: { id: 1, nombre: 'Administrador Demo', rol: 'ADMIN' },
    };
  }
  return null;
}

export const authService = {
  register: (payload) => httpRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => {
    const demo = demoLogin(payload);
    if (demo) return Promise.resolve(demo);
    return httpRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  },
  logout: () => httpRequest('/api/auth/logout', { method: 'POST' }),
  verify: () => httpRequest('/api/auth/verify'),
};
