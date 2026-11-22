import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/httpError.js';

export function authenticate(req, _res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new HttpError(500, 'JWT_SECRET no está configurado'));
  }

  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Autenticación requerida'));
  }

  try {
    req.user = jwt.verify(authorization.slice(7), secret);
    return next();
  } catch {
    return next(new HttpError(401, 'JWT inválido o expirado'));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new HttpError(403, 'Acceso restringido'));
    }
    return next();
  };
}
