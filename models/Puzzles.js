const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
  puzzleId: {
    type: String,
  },
  fen: {
    type: String,
  },
  color: {
    type: String,
  },
  start: {
    type: String,
  },
  answer: {
    type: [String],
  },
  movesUCI: {
    type: [String],
  },
  rating: { 
    type: Number, 
    index: true 
  },
  ratingDeviation: {
    type: Number,
  },
  popularity: {
    type: Number,
  },
  nbPlays: {
    type: Number,
  },
  themes: {
    type: [String],
  },
  gameUrl: {
    type: String,
  },
  openingTags: {
    type: String,
  },
});

const Puzzles = mongoose.model("Puzzles", puzzleSchema);

module.exports = Puzzles;

// PuzzleId		00sHx
// FEN			q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17
// Moves			e8d7 a2e6 d7d8 f7f8
// Rating			1760
// RatingDeviation	80
// Popularity		83
// NbPlays		72
// Themes		mate mateIn2 middlegame short
// GameUrl		https://lichess.org/yyznGmXs/black#34
// Opening Tags		Italian_Game Italian_Game_Classical_Variation