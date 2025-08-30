const jwt = require('jsonwebtoken');

module.exports = function auth(requiredRoles = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload; // { userId, email, role }

      if (
        Array.isArray(requiredRoles) &&
        requiredRoles.length > 0 &&
        !requiredRoles.includes(payload.role)
      ) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};
