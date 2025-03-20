// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  console.log(token);

  if (!token) return res.status(401).json({ message: 'No se proporcionó token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;

// const authMiddleware = async (req, res, next) => {
//   console.log('Authorization header:', req.headers.authorization);
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   console.log(token);
//   if (!token) return res.status(401).json({ message: 'No se proporcionó token' });
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select('-password');
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Token inválido' });
//   }
// };

