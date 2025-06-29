const GenreModel = require('../models/genreModel');

exports.getAllGenres = async (req, res) => {
  try {
    const genres = await GenreModel.findAll();
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGenreById = async (req, res) => {
  try {
    const genre = await GenreModel.findById(req.params.id);
    if (!genre) return res.status(404).json({ success: false, error: 'Genre not found' });
    res.status(200).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 