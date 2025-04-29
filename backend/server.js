const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const manufacturerRoutes = require('./routes/manufacturers');
const categoryRoutes = require('./routes/categories');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', require('./routes/user')); // or './routes/users'

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
