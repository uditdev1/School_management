// Entry Point - Express server setup and MongoDB connection
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config({ path: __dirname + '/.env' });

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();


app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://schoolmanagmet1.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_management';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

async function seedAdmin() {
  try {
    const User = require('./models/User');

    // Delete old admin and recreate
    await User.deleteMany({ email: 'admin@school.com' });

    // Don't hash manually — the User model pre-save hook handles it
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@school.com',
      password: 'Admin@123',
      role: 'admin',
    });

    await admin.save(); // pre-save hook will hash the password correctly

    console.log('Admin created → admin@school.com / Admin@123');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = app;