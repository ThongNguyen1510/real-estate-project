const express = require('express');
const app = express();
const reviewRoutes = require('./routes/reviews');

// Middleware
app.use(express.json());
app.use('/api', reviewRoutes);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

module.exports = app;
