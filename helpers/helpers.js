const Puzzles = require('../models/Puzzles.js');

function getNumOfPuzzles(time) {
    let min = 40;
    return min + time * 10;
}

const getNewPuzzlesSet = async (lastRating) => {
  let startingRating = lastRating || 500;

  if (startingRating < 500) {
    startingRating = Math.floor(Math.random() * 40) + 500;
  }

  const puzzlesPerSet = 50;
  const puzzles = [];

  while (puzzles.length < puzzlesPerSet) {
    // Calcular una diferencia aleatoria de calificación entre 5 y 40 puntos
    const randomDifference = Math.floor(Math.random() * 36) + 5;

    // Buscar un puzzle que cumpla con los criterios
    const puzzle = await Puzzles.findOne({
      rating: {
        $gte: startingRating,
        $lt: startingRating + randomDifference
      }
    }).sort({ rating: 1 });

    if (puzzle) {
      puzzles.push(puzzle);
      // Aumentar la calificación inicial en la diferencia aleatoria para el próximo puzzle
      startingRating = puzzle.rating + randomDifference;
    } else {
      // Si no se encuentra un puzzle que cumpla con los criterios, aumentar la calificación inicial y continuar
      startingRating += 40;
    }
  }

  return puzzles;
};

module.exports = {
  getNumOfPuzzles, getNewPuzzlesSet
};