import * as SecureStore from 'expo-secure-store';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000').replace(/\/$/, '');

export async function httpRequest(path, options = {}) {
  const token = await SecureStore.getItemAsync('utr_user_token');
  const headers = {
    'x-api-token': process.env.EXPO_PUBLIC_API_APP_TOKEN || '',
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

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      await SecureStore.deleteItemAsync('utr_user_token');
      await SecureStore.deleteItemAsync('utr_user');
    }
    const error = new Error(data?.message || 'Error al procesar la solicitud');
    error.status = response.status;
    throw error;
  }
  return data;
}
