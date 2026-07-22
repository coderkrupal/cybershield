import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import scanRoutes from './routes/scan.js';
import incidentRoutes from './routes/incidents.js';
import trackerRoutes from './routes/tracker.js';

// Load environment variables
dotenv.config();

// Create Express Server
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database (In-Memory or Local/External URI)
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allow all headers for testing/dev ease
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing Prefixes
app.use('/api/scan', scanRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/tracker', trackerRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'CyberShield API is running successfully.' });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(` CyberShield Security Backend running on port ${PORT}`);
  console.log(` Active environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`================================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down server...');
  server.close(async () => {
    import('./config/db.js').then(({ closeDB }) => closeDB());
    console.log('Express server closed.');
  });
});
