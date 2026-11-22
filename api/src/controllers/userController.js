import User from '../models/User.js';
import { HttpError } from '../utils/httpError.js';

export async function listUsers(_req, res, next) {
  try {
    const users = await User.find({}).sort({ id: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function changeUserRole(req, res, next) {
  try {
    const { rol } = req.body;
    if (!['ADMIN', 'USER'].includes(rol)) {
      throw new HttpError(400, 'El rol debe ser ADMIN o USER');
    }

    const user = await User.findOneAndUpdate(
      { id: Number(req.params.id) },
      { rol },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new HttpError(404, 'Usuario no encontrado');
    }

    res.json({ id: user.id, nombre: user.nombre, matricula: user.matricula, rol: user.rol });
  } catch (error) {
    next(error);
  }
}
