const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const initializeFirebase = require('./config/firebase');
const cron = require('node-cron');
const automationService = require('./services/automationService');

dotenv.config();

connectDB();

initializeFirebase();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/automations', require('./routes/automationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));


app.get('/', (req, res) => {
  res.send('TaskBoard Pro API is running');
});

// schedule due date
cron.schedule('0 * * * *', async () => {
  console.log('Running due date automation check');
  await automationService.processDueDatePassed();
})

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});