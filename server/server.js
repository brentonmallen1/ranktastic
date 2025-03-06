
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request received`);
  
  // Log request headers for debugging
  console.log('Request headers:', req.headers);
  
  // Log request body for debugging (if any)
  if (req.body) {
    console.log('Request body:', req.body);
  }

  // Capture original send method to intercept response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Response sent: ${res.statusCode} (${duration}ms)`);
    return originalSend.apply(this, arguments);
  };

  next();
});

// Parse JSON request body
app.use(express.json());

// Enable CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Verify routes directory exists before attempting to load routes
const routesPath = path.join(__dirname, 'routes');
console.log(`Checking for routes directory at: ${routesPath}`);

if (fs.existsSync(routesPath)) {
  console.log('Routes directory found, loading routes...');
  try {
    const routes = require('./routes/index');
    app.use('/', routes);
    console.log('Routes loaded successfully');
  } catch (err) {
    console.error('Error loading routes:', err);
    process.exit(1);
  }
} else {
  console.error('FATAL: Routes directory does not exist!');
  console.log('Current directory structure:');
  const files = fs.readdirSync(__dirname);
  console.log(files);
  process.exit(1);
}

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'RankChoice API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 404 handler - this must be last
app.use((req, res) => {
  console.error(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS configured with options:`, corsOptions);
});

module.exports = app;
