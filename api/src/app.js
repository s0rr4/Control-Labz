import express from 'express';
import cors from 'cors';
import { verifyAppToken } from './middleware/appToken.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import labRoutes from './routes/labRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(verifyAppToken);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/labs', labRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
