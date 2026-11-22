import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError } from '../utils/httpError.js';
import { nextSequence } from '../utils/counters.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, matricula: user.matricula, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function register(req, res, next) {
  try {
    const { nombre, matricula, email, password } = req.body;
    if (!nombre || !matricula || !email || !password) {
      throw new HttpError(400, 'Nombre, matrícula, email y contraseña son obligatorios');
    }
    if (password.length < 8) {
      throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres');
    }

    const id = await nextSequence('users');
    const user = await User.create({
      id,
      nombre,
      matricula,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 12),
      rol: 'USER',
      activo: true,
    });

    res.status(201).json({
      token: signToken(user),
      user: { id: user.id, nombre: user.nombre, rol: user.rol },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpError(400, 'Email y contraseña son obligatorios');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), activo: true }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    res.json({
      token: signToken(user),
      user: { id: user.id, nombre: user.nombre, rol: user.rol },
    });
  } catch (error) {
    next(error);
  }
}

export function logout(_req, res) {
  res.json({ message: 'Sesión cerrada correctamente' });
}

export async function verify(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id, activo: true });
    if (!user) {
      throw new HttpError(401, 'Usuario no disponible');
    }
    res.json({ id: user.id, nombre: user.nombre, matricula: user.matricula, rol: user.rol });
  } catch (error) {
    next(error);
  }
}
