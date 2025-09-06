const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.listUsers = async (_req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: role || 'student' });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

exports.updateUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const update = {};
  if (name) update.name = name;
  if (email) update.email = email;
  if (role) update.role = role;
  if (password) update.passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true });
};