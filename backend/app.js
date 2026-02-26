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

// serve frontend build if present
const path = require('path');
// vite builds to "dist" by default
const buildDir = path.join(__dirname, '../frontend/dist');
if (require('fs').existsSync(buildDir)) {
  app.use(express.static(buildDir));
  // catch-all to send index.html for SPA routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/scan') || req.path.startsWith('/usage') || req.path.startsWith('/admin') || req.path === '/ping') {
      return next();
    }
    res.sendFile(path.join(buildDir, 'index.html'));
  });
} else {
  // if build not available, provide simple message on root so preview isn't blank
  app.get('/', (req, res) => {
    res.send('Frontend build not found; run `npm run build` in the frontend folder (Vite outputs to /dist) or start the React dev server');
  });
}

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
