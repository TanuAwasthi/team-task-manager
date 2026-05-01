import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/auth.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// const __dirname = path.resolve();
// const clientBuildPath = path.join(__dirname, 'public');
// app.use(express.static(clientBuildPath));

// app.get('*', (req, res) => {
//   if (req.path.startsWith('/api/')) {
//     return res.status(404).json({ message: 'Route not found' });
//   }
//   res.sendFile(path.join(clientBuildPath, 'index.html'));
// });

app.use(errorHandler);

const startServer = async () => {
  try {
    //await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
