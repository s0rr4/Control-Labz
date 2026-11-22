import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    tipo: { type: String, enum: ['Proyector', 'Cable HDMI', 'Switch'], required: true },
    numeroSerie: { type: String, required: true, unique: true, trim: true },
    laboratorio: { type: String, enum: ['Lab-A', 'Lab-B', 'Redes'], required: true },
    estatus: { type: String, enum: ['DISPONIBLE', 'ASIGNADO', 'MANTENIMIENTO'], default: 'DISPONIBLE' },
  },
  { timestamps: true }
);

equipmentSchema.set('toJSON', {
  transform(_document, returnedObject) {
    delete returnedObject._id;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject.__v;
    return returnedObject;
  },
});

export default mongoose.model('Equipment', equipmentSchema);
