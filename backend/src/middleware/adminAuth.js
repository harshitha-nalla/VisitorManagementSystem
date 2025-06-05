const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the token is for an admin and matches the admin email
    if (decoded.role !== 'admin' || decoded.email !== process.env.ADMIN_EMAIL) {
      throw new Error('Not authorized as admin');
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

module.exports = adminAuth; 