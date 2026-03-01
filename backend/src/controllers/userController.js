const userService = require('../services/userService');

exports.create = async (req, res) => {
  const user = await userService.create(req.body);
  res.json(user);
};

exports.index = async (req, res) => {
  const users = await userService.list();
  res.json(users);
};

exports.show = async (req, res) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};