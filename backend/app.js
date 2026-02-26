const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./services/auth/routes');
const { requireAuth } = require('./middleware/auth');
const scanRoutes = require('./services/scanning/routes');
const adminRoutes = require('./services/admin/routes');

const app = express();
app.use(bodyParser.json());

// simple health check
app.get('/ping', (req, res) => res.send('pong'));

// open routes
app.use('/auth', authRoutes);

// scanning (protected and tracked)
app.use('/scan', scanRoutes);

// usage metrics
const usageRoutes = require('./services/usage/routes');
app.use('/usage', usageRoutes);

// admin
app.use('/admin', adminRoutes);

// example protected route
app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = app;
