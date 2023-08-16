const helpers = require("./helpers");
const { filterPuzzles, getNewPuzzlesSet, getNumOfPuzzles } = helpers;
const { Server } = require("socket.io");
const Player = require("../models/Player.js");

state = {};

async function finishGame(socketId) {
  // Comprueba si el juego ya terminó
  if (!(socketId in state)) {
    return;
  }
  let gameState = JSON.parse(JSON.stringify(state[socketId]));
  delete state[socketId];

  if (gameState.isUserLoggedIn) {
    // Solo guardar datos si el usuario está logueado
    let player = await Player.findOne({ username: gameState.username });
    if (player) {
      // Actualizar los campos que desees
      player.score += gameState.score;

      // Actualizar datos del puzzle que haya jugado
      switch (gameState.puzzle10x) {
        case 3:
          if (gameState.score > player.puzzle10x.puzzle3min) {
            player.puzzle10x.puzzle3min = gameState.score;
          }
          break;
        case 5:
          if (gameState.score > player.puzzle10x.puzzle5min) {
            player.puzzle10x.puzzle5min = gameState.score;
          }
          break;
        case 10:
          if (gameState.score > player.puzzle10x.puzzle10min) {
            player.puzzle10x.puzzle10min = gameState.score;
          }
          break;
        case 15:
          if (gameState.score > player.puzzle10x.puzzle15min) {
            player.puzzle10x.puzzle15min = gameState.score;
          }
          break;

        default:
          break;
      }
      await player.save();
    }
  }
}

function setupWs(server, sessionMiddleware) {
  console.log("Setting up WebSocket");
  const io = new Server(server);
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });
  console.log("Socket.io listening.");

  io.on("connection", (socket) => {
    console.log("New WebSocket connection");
    const session = socket.request.session;
    const isUserLoggedIn = !!session.userID;
    const username = isUserLoggedIn ? session.username : null;
    console.log("Session data inside WebSocket:", session);

    socket.on("start", async (msg) => {
      console.log("Start event received:", msg);
      console.log("Is user logged in:", isUserLoggedIn);
      console.log("Session username:", session.username);
      if (socket.id in state) {
        await finishGame(socket.id, isUserLoggedIn);
      }
      let usernameToUse = isUserLoggedIn ? session.username : msg.username;
      console.log("Username to use:", usernameToUse);
      let numOfPuzzles = getNumOfPuzzles(msg.selectedTime);
      let puzzles = await getNewPuzzlesSet(numOfPuzzles);
      console.log("Puzzles retrieved:", puzzles);

      let newGame = {
        username: usernameToUse,
        puzzle10x: msg.selectedTime,
        puzzleStartDateTime: new Date(),
        puzzleEndDateTime: new Date(
          new Date().getTime() + msg.selectedTime * 60000
        ),
        puzzles: puzzles,
        curr: 0,
        score: 0,
        currentAnsIter: 0,
        isUserLoggedIn: isUserLoggedIn,
      };

      state[socket.id] = newGame;

      let puzzle = puzzles[newGame.curr];
      if (!puzzle) {
        console.error("Puzzle is still undefined:", newGame.curr, puzzles);
        return;
      }

      let reply = {
        puzzleEndDateTime: newGame.puzzleEndDateTime,
        puzzle: {
          id: puzzle.id,
          rating: puzzle.rating,
          fen: puzzle.fen,
          color: puzzle.color,
          start: puzzle.start,
        },
      };

      console.log("emit: ", reply);
      socket.emit("start", reply);

      setTimeout(async () => {
        await finishGame(socket.id);
      }, msg.selectedTime * 60000);
    });

    socket.on("move", async (msg) => {
      // Código para manejar el evento de movimiento
      console.log("evento move:", msg);
      if (!(socket.id in state)) {
        return;
      }
      // comprobar si el juego terminó
      let timeDifference =
        state[socket.id].puzzleEndDateTime.getTime() - new Date().getTime();
      if (timeDifference < 0) {
        await finishGame(socket.id);
        return;
      }
      let puzzle = state[socket.id].puzzles[state[socket.id].curr];
      if (puzzle.answer[state[socket.id].currentAnsIter] !== msg.move) {
        // Movimiento incorrecto
        state[socket.id].currentAnsIter = 0;
        state[socket.id].curr++;
        if (state[socket.id].puzzles.length === state[socket.id].curr) {
          const extendedPuzzles = await getNewPuzzlesSet(
            state[socket.id].blockNumber
          );
          const lastRating =
            state[socket.id].puzzles[state[socket.id].puzzles.length - 1]
              .rating;
          const newPuzzles = await getNewPuzzlesSet(lastRating);
          state[socket.id].puzzles.push(...newPuzzles);
        }
        let puzzleN = state[socket.id].puzzles[state[socket.id].curr];

        if (!puzzleN) {
          console.error(
            "Puzzle not found:",
            state[socket.id].curr,
            state[socket.id].puzzles
          );
          return; // Detiene la ejecución si puzzleN es undefined
        }

        reply = {
          correct: false,
          puzzle: {
            id: puzzleN.id,
            rating: puzzleN.rating,
            fen: puzzleN.fen,
            color: puzzleN.color,
            start: puzzleN.start,
          },
        };
        console.log("emit: ", reply);
        socket.emit("change", reply);
      } else {
        state[socket.id].currentAnsIter++;
        if (state[socket.id].currentAnsIter != puzzle.answer.length) {
          // movimiento correcto pero el rompecabezas no ha terminado
          let reply = { move: puzzle.answer[state[socket.id].currentAnsIter] };
          console.log("emit: ", reply);
          socket.emit("move", reply);
          state[socket.id].currentAnsIter++;
        } else {
          // movimiento correcto y puzzle terminado
          state[socket.id].currentAnsIter = 0;
          state[socket.id].curr++;
          state[socket.id].score++;

          if (state[socket.id].curr == 49) {
            // After completing the 49th puzzle, load new puzzles
            const lastRating =
              state[socket.id].puzzles[state[socket.id].curr].rating;
            console.log(
              `Loading 50 new puzzles starting from a rating of ${lastRating}`
            );
            const newPuzzles = await getNewPuzzlesSet(lastRating);
            state[socket.id].puzzles = newPuzzles;
            state[socket.id].curr = 0; // Reset the current puzzle counter
          }

          let puzzleN = state[socket.id].puzzles[state[socket.id].curr];
          reply = {
            correct: true,
            puzzle: {
              id: puzzleN.id,
              rating: puzzleN.rating,
              fen: puzzleN.fen,
              color: puzzleN.color,
              start: puzzleN.start,
            },
          };
          console.log("emit: ", reply);
          socket.emit("change", reply);
        }
      }
    });

    socket.on("end", async (msg) => {
      // La partida ya ha acabado
      console.log("evento end:", msg);
      if (!(socket.id in state)) {
        return;
      }
      await finishGame(socket.id);
    });

    socket.on("disconnect", async () => {
      console.log("Evento disconnect");
      if (!(socket.id in state)) {
        return;
      }
      await finishGame(socket.id);
    });
  });
}

module.exports = setupWs;
