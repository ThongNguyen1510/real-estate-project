const express = require('express');
const app = express();
const cors = require('cors');
const propertyRoutes = require('./routes/propertiesRoutes');
const imageRoutes = require('./routes/imageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const mapRoutes = require('./routes/mapRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('======================\n');
  next();
});

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/properties', reviewRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/search', searchRoutes);

// Log registered routes
console.log('\n=== Registered Routes ===');
app._router.stack.forEach(function(middleware){
    if(middleware.route){ // routes registered directly on the app
        console.log(`${Object.keys(middleware.route.methods).join(',')} ${middleware.route.path}`);
    } else if(middleware.name === 'router'){ // router middleware 
        middleware.handle.stack.forEach(function(handler){
            if(handler.route){
                const methods = Object.keys(handler.route.methods);
                const path = handler.route.path;
                console.log(`${methods.join(',')} ${middleware.regexp}${path}`);
            }
        });
    }
});
console.log('======================\n');

// Error handling
app.use((err, req, res, next) => {
  console.error('\n=== Error ===');
  console.error('Time:', new Date().toISOString());
  console.error('URL:', req.url);
  console.error('Error:', err.stack);
  console.error('======================\n');
  res.status(500).json({ message: 'Lỗi server' });
});

// 404 handler
app.use((req, res) => {
  console.log('\n=== 404 Not Found ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('======================\n');
  res.status(404).json({ message: 'Không tìm thấy route này' });
});

module.exports = app; 