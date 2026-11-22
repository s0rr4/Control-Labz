import mongoose from 'mongoose';
import Computer from '../models/Computer.js';
import Equipment from '../models/Equipment.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import { HttpError } from '../utils/httpError.js';
import { nextSequence } from '../utils/counters.js';

export async function listComputers(req, res, next) {
  try {
    const filters = {};
    if (req.query.laboratorio) filters.laboratorio = req.query.laboratorio;
    if (req.query.estatus) filters.estatus = req.query.estatus;

    const computers = await Computer.find(filters).sort({ laboratorio: 1, id: 1 });
    res.json(computers);
  } catch (error) {
    next(error);
  }
}

export async function createComputer(req, res, next) {
  try {
    const { numeroInventario, laboratorio, especificaciones, perifericosIncluidos } = req.body;
    if (!numeroInventario || !laboratorio || !especificaciones) {
      throw new HttpError(400, 'Número de inventario, laboratorio y especificaciones son obligatorios');
    }
    if (!['Lab-A', 'Lab-B', 'Redes'].includes(laboratorio)) {
      throw new HttpError(400, 'Laboratorio inválido');
    }

    const computer = await Computer.create({
      id: await nextSequence('computers'),
      numeroInventario,
      laboratorio,
      especificaciones,
      perifericosIncluidos: Array.isArray(perifericosIncluidos) ? perifericosIncluidos : [],
      estatus: 'DISPONIBLE',
    });
    res.status(201).json(computer);
  } catch (error) {
    next(error);
  }
}

export async function createEquipment(req, res, next) {
  try {
    const { tipo, numeroSerie, laboratorio } = req.body;
    if (!tipo || !numeroSerie || !laboratorio) {
      throw new HttpError(400, 'Tipo, número de serie y laboratorio son obligatorios');
    }
    if (!['Proyector', 'Cable HDMI', 'Switch'].includes(tipo)) {
      throw new HttpError(400, 'Tipo de equipo inválido');
    }
    if (!['Lab-A', 'Lab-B', 'Redes'].includes(laboratorio)) {
      throw new HttpError(400, 'Laboratorio inválido');
    }

    const equipment = await Equipment.create({
      id: await nextSequence('equipment'),
      tipo,
      numeroSerie,
      laboratorio,
      estatus: 'DISPONIBLE',
    });
    res.status(201).json(equipment);
  } catch (error) {
    next(error);
  }
}

export async function createAssignment(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { computerId, materia, horasUso } = req.body;
    let userId = req.user.rol === 'ADMIN' ? Number(req.body.userId) : req.user.id;

    if (!computerId || !materia || !Number.isFinite(Number(horasUso)) || Number(horasUso) <= 0) {
      throw new HttpError(400, 'Computadora, materia y horas de uso positivas son obligatorias');
    }
    if (!Number.isInteger(Number(userId))) {
      throw new HttpError(400, 'Usuario inválido');
    }

    const user = await User.findOne({ id: userId, activo: true }).session(session);
    if (!user) throw new HttpError(404, 'Usuario no encontrado');

    const existingUserAssignment = await Assignment.findOne({
      userId,
      estatus: 'ASIGNADA',
    }).session(session);
    if (existingUserAssignment) {
      throw new HttpError(409, 'El usuario ya tiene una asignación activa');
    }

    const computer = await Computer.findOneAndUpdate(
      { id: Number(computerId), estatus: 'DISPONIBLE' },
      { estatus: 'OCUPADA' },
      { new: true, session }
    );
    if (!computer) {
      throw new HttpError(409, 'La computadora no está disponible');
    }

    const assignmentId = await nextSequence('assignments');
    const [assignment] = await Assignment.create(
      [{
        id: assignmentId,
        computerId: computer.id,
        userId,
        materia,
        horasUso: Number(horasUso),
        inicio: new Date(),
        estatus: 'ASIGNADA',
        reporteFalla: false,
        descripcionFalla: '',
      }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({
      assignmentId: assignment.id,
      estatus: assignment.estatus,
      inicio: assignment.inicio,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
}

export async function listAssignments(req, res, next) {
  try {
    const filters = req.user.rol === 'ADMIN' ? {} : { userId: req.user.id };
    const assignments = await Assignment.find(filters).sort({ inicio: -1 });

    const computerIds = [...new Set(assignments.map((assignment) => assignment.computerId))];
    const userIds = [...new Set(assignments.map((assignment) => assignment.userId))];
    const [computers, users] = await Promise.all([
      Computer.find({ id: { $in: computerIds } }),
      User.find({ id: { $in: userIds } }).select('id nombre matricula'),
    ]);
    const computerMap = new Map(computers.map((computer) => [computer.id, computer]));
    const userMap = new Map(users.map((user) => [user.id, user]));

    res.json(assignments.map((assignment) => ({
      ...assignment.toJSON(),
      computer: computerMap.get(assignment.computerId) || null,
      user: userMap.get(assignment.userId) || null,
    })));
  } catch (error) {
    next(error);
  }
}

export async function releaseAssignment(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const assignment = await Assignment.findOne({ id: Number(req.params.id) }).session(session);
    if (!assignment) throw new HttpError(404, 'Asignación no encontrada');
    if (req.user.rol !== 'ADMIN' && assignment.userId !== req.user.id) {
      throw new HttpError(403, 'No puedes liberar una asignación ajena');
    }
    if (assignment.estatus === 'LIBERADA') {
      throw new HttpError(409, 'La asignación ya fue liberada');
    }

    const reporteFalla = req.body.reporteFalla === true;
    const descripcionFalla = typeof req.body.descripcionFalla === 'string'
      ? req.body.descripcionFalla.trim()
      : '';
    if (reporteFalla && !descripcionFalla) {
      throw new HttpError(400, 'La descripción de la falla es obligatoria');
    }

    assignment.estatus = 'LIBERADA';
    assignment.reporteFalla = reporteFalla;
    assignment.descripcionFalla = reporteFalla ? descripcionFalla : '';
    await assignment.save({ session });

    await Computer.findOneAndUpdate(
      { id: assignment.computerId },
      { estatus: 'DISPONIBLE' },
      { session }
    );

    await session.commitTransaction();
    res.json({
      assignmentId: assignment.id,
      estatus: assignment.estatus,
      reporteFalla: assignment.reporteFalla,
      descripcionFalla: assignment.descripcionFalla,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
}
