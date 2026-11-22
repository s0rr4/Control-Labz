import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    nombre: { type: String, required: true, trim: true },
    matricula: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    rol: { type: String, enum: ['ADMIN', 'USER'], default: 'USER', required: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform(_document, returnedObject) {
    delete returnedObject._id;
    delete returnedObject.password;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject.__v;
    return returnedObject;
  },
});

export default mongoose.model('User', userSchema);
