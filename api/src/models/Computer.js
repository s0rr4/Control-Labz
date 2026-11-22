import mongoose from 'mongoose';

const computerSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    numeroInventario: { type: String, required: true, unique: true, trim: true },
    laboratorio: { type: String, enum: ['Lab-A', 'Lab-B', 'Redes'], required: true },
    especificaciones: { type: String, required: true, trim: true },
    perifericosIncluidos: [{ type: String, trim: true }],
    estatus: {
      type: String,
      enum: ['DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO'],
      default: 'DISPONIBLE',
    },
  },
  { timestamps: true }
);

computerSchema.set('toJSON', {
  transform(_document, returnedObject) {
    delete returnedObject._id;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject.__v;
    return returnedObject;
  },
});

export default mongoose.model('Computer', computerSchema);
