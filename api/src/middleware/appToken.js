import { HttpError } from '../utils/httpError.js';

export function verifyAppToken(req, _res, next) {
  const configuredToken = process.env.APP_TOKEN;
  if (!configuredToken) {
    return next(new HttpError(500, 'APP_TOKEN no está configurado'));
  }

  if (req.headers['x-api-token'] !== configuredToken) {
    return next(new HttpError(401, 'Token de aplicación inválido'));
  }

  return next();
}
