import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

process.env.APP_TOKEN = 'test-app-token';
process.env.JWT_SECRET = 'test-jwt-secret';

test('rechaza solicitudes sin x-api-token', async () => {
  const server = app.listen(0);
  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/verify`);
    assert.equal(response.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rechaza un JWT inválido', async () => {
  const server = app.listen(0);
  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/verify`, {
      headers: {
        'x-api-token': 'test-app-token',
        Authorization: 'Bearer token-invalido',
      },
    });
    assert.equal(response.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('devuelve 404 para rutas inexistentes', async () => {
  const server = app.listen(0);
  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/ruta-inexistente`, {
      headers: { 'x-api-token': 'test-app-token' },
    });
    assert.equal(response.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
