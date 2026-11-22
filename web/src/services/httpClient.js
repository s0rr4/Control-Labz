const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function httpRequest(path, options = {}) {
  const token = localStorage.getItem('utr_user_token');
  const headers = {
    'x-api-token': import.meta.env.VITE_API_APP_TOKEN || '',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('No fue posible conectar con el servidor');
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('utr_user_token');
      localStorage.removeItem('utr_user');
      window.dispatchEvent(new Event('utr:unauthorized'));
    }
    const error = new Error(data?.message || 'Error al procesar la solicitud');
    error.status = response.status;
    throw error;
  }
  return data;
}
