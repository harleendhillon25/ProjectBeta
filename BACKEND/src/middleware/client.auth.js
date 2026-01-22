const jwt = require('jsonwebtoken');

module.exports = function jwtAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'JWT required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.clientId = payload.clientId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid JWT' });
  }
};