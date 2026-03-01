const userService = require('../services/userService');

exports.create = async (req, res) => {
  const user = await userService.create(req.body);
  res.json(user);
};

exports.index = async (req, res) => {
  const users = await userService.list();
  res.json(users);
};