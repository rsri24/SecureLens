// admin middleware
// ensures request is from a user with role ADMIN

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'not authenticated' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'admin access required' });
  }
  next();
}

module.exports = { requireAdmin };
