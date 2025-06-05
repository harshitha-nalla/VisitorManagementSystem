require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const employeeVisitorRoutes = require('./routes/visitors');
const securityVisitorRoutes = require('./routes/visitors.route');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employee/visitors', employeeVisitorRoutes); // Employee pre-booking routes
app.use('/api/visitors', securityVisitorRoutes); // Security guard visitor registration routes
app.use('/api/admin', adminRoutes); // Admin routes for employee management

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 