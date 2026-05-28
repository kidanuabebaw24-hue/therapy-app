import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cbtRoutes from './routes/cbtRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import exposureRoutes from './routes/exposureRoutes.js';
import therapistRoutes from './routes/therapistRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import therapistAssignmentRoutes from './routes/therapistAssignmentRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import morgan from 'morgan';
import { sendError } from './utils/responseHelper.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cbt', cbtRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/exposure', exposureRoutes);
app.use('/api/therapists', therapistRoutes);

app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/assignments', therapistAssignmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Theraphy API (PostgreSQL/Prisma) is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  return sendError(res, err.message || 'Something went wrong!', 500, err);
});

export default app;
