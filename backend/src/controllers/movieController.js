const movieService = require('../services/movieService');

exports.create = async (req, res) => {
  const movie = await movieService.create(req.body);
  res.json(movie);
};

exports.index = async (req, res) => {
  const movies = await movieService.list();
  res.json(movies);
};