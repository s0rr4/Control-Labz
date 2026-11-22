export function notFound(req, _res, next) {
  next({ statusCode: 404, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Error interno del servidor';

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || {})[0] || 'recurso';
    message = `Ya existe un registro con ese ${field}`;
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)[0]?.message || 'Datos inválidos';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Identificador inválido';
  }

  res.status(statusCode).json({ message });
}
