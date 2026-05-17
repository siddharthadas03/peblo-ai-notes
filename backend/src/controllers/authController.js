const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ user: userResponse(user), token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() });

    if (!user || !(await user.matchPassword(password || ''))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ user: userResponse(user), token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};

module.exports = { signup, login, me };
