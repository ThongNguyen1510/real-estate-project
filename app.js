const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertiesRoutes');
const searchRoutes = require('./routes/searchRoutes');
const mapRoutes = require('./routes/mapRoutes');
const imageRoutes = require('./routes/imageRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const newsRoutes = require('./routes/newsRoutes');
const locationRoutes = require('./routes/locationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', userRoutes);  // Auth routes (login, register, etc.)
app.use('/api/users', userRoutes); // User profile routes
app.use('/api/properties', propertyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes); // Tài liệu
app.use('/api/notifications', notificationRoutes); // Thông báo
app.use('/api', reportRoutes); // Báo cáo tin đăng

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
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Lỗi server'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API không tồn tại'
    });
});

module.exports = app; 