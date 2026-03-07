const movieService = require('../services/movieService');

exports.create = async (req, res) => {
  const movie = await movieService.create(req.body);
  res.json(movie);
};

exports.index = async (req, res) => {
  const movies = await movieService.list();
  res.json(movies);
};

exports.show = async (req, res) => {
  try {
    const movie = await movieService.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveEmbeddings = async (req, res) => {
  try {
    const embeddings = req.body;
    await movieService.saveEmbeddings(embeddings);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { queryVector } = req.body;
    if (!queryVector) {
      return res.status(400).json({ message: 'queryVector is required' });
    }
    const results = await movieService.vectorSearch(queryVector);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};