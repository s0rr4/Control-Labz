import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('No fue posible iniciar la API:', error.message);
  process.exit(1);
});
