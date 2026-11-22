import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    computerId: { type: Number, required: true },
    userId: { type: Number, required: true },
    materia: { type: String, required: true, trim: true },
    horasUso: { type: Number, required: true, min: 0.01 },
    inicio: { type: Date, required: true, default: Date.now },
    estatus: { type: String, enum: ['ASIGNADA', 'LIBERADA'], default: 'ASIGNADA' },
    reporteFalla: { type: Boolean, default: false },
    descripcionFalla: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

assignmentSchema.set('toJSON', {
  transform(_document, returnedObject) {
    delete returnedObject._id;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject.__v;
    return returnedObject;
  },
});

assignmentSchema.index(
  { computerId: 1 },
  { unique: true, partialFilterExpression: { estatus: 'ASIGNADA' } }
);
assignmentSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { estatus: 'ASIGNADA' } }
);

export default mongoose.model('Assignment', assignmentSchema);
