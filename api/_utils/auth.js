const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'self-manage-system-secret-key-2024';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};

const authenticateToken = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return { valid: false, error: '未提供认证令牌' };
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return { valid: false, error: '令牌无效或已过期' };
  }
  
  return { valid: true, user: decoded };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken
};
