const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'https://chat-app-x08.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(bodyParser.json());

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  // Your login logic here
  res.status(200).json({ message: 'Login successful' });
});

// Handle OPTIONS requests for CORS preflight
app.options('*', cors());

// Export the Express app as a serverless function
module.exports = app; 