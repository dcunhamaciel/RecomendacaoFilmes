const ratingService = require('../services/ratingService');

exports.create = async (req, res) => {
  const rating = await ratingService.create(req.body);
  res.json(rating);
};

exports.index = async (req, res) => {
  const ratings = await ratingService.list();
  res.json(ratings);
};

exports.getByUser = async (req, res) => {
  const { userId } = req.params;

  const ratings = await ratingService.getByUser(Number(userId));
  res.json(ratings);
};