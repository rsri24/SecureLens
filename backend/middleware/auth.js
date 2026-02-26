const jwt = require('jsonwebtoken');
const prisma = require('../shared/prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-prod';

// middleware to protect routes
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ error: 'user not found' });
    }
    // attach to request
    req.user = { id: user.id, email: user.email, planType: user.planType, role: user.role };
    next();
  } catch (err) {
    console.error('auth middleware error', err);
    return res.status(401).json({ error: 'invalid token' });
  }
}

module.exports = { requireAuth };
