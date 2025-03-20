// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Verifica si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    const user = new User({ email, password, name });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log('Datos recibidos en login:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuario no encontrado para:', email);
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Contraseña incorrecta para:', email);
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

module.exports = { registerUser, loginUser };
