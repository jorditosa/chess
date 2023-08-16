const moveAudio = new Audio("sounds/Move.mp3");
const captureAudio = new Audio("sounds/Capture.mp3");
const confirmAudio = new Audio("sounds/Confirmation.mp3");
const startAudio = new Audio("sounds/Berserk.mp3");
const endAudio = new Audio("sounds/Error.mp3");
const gameOverAudio = new Audio("sounds/gameOver.wav");
const gameFinishAudio = new Audio("sounds/Victory.mp3");
const lowTimeAudio = new Audio("sounds/LowTime.mp3");
var socket = io();
function showCongratulationsPopup() {
  // Create a popup element
  const popup = document.createElement("div");
  popup.id = "congratulationsPopup";
  popup.innerText = "¡Felicidades! ¡Has completado los primeros 50 puzzles!";
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.padding = "20px";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  popup.style.color = "white";
  popup.style.fontSize = "18px";
  popup.style.borderRadius = "10px";
  popup.style.zIndex = "1000";

  // Append the popup to the body
  document.body.appendChild(popup);

  // Remove the popup after 2 seconds
  setTimeout(() => {
    document.body.removeChild(popup);
  }, 2000);
}

let puzzle;
let userHistory;
let id;
let correct;
let wrong;
let puzzleEndDateTime;
let timerId;
let board;
let $boardHighlighting = $("#myBoard");
let game;

function removeHighlights() {
  let squareClass = "square-55d63";
  $boardHighlighting.find("." + squareClass).removeClass("highlight-white");
  $boardHighlighting.find("." + squareClass).removeClass("highlight-black");
}

function start() {
  let username = ""; // Inicializar como cadena vacía
  // Comprobar si existe el campo de entrada para el nombre de usuario
  if ($('input[name="username"]').length) {
    username = $('input[name="username"]').val();
    if (!username) {
      alert("Username can't be empty.");
      return;
    }
  }
  let selectedTime = Number($('input[name="timeSelect"]:checked').val());
  $("#startPage").hide();
  $("#loadingPage").css("display", "flex");
  socket.emit("start", { username: username, selectedTime: selectedTime });
}

socket.on("start", function (msg) {
  console.log("evento start:", msg);
  $("#loadingPage").hide();
  $("#gameDiv").css("display", "grid");
  startAudio.play();
  puzzle = msg.puzzle;
  userHistory = [];
  id = 0;
  correct = 0;
  wrong = 0;
  puzzleEndDateTime = new Date(msg.puzzleEndDateTime);
  timerId = setInterval(() => {
    timer(puzzleEndDateTime, timerId);
  }, 1000);
  loadPuzzle();
});

socket.on("move", function (msg) {
  console.log("evento move:", msg);
  if (id === 49) {
    // After completing the 49th puzzle, the next one will be the 20th
    showCongratulationsPopup(); // Show the congratulations popup
  }

  const mv = game.move(msg.move);
  board.position(game.fen());

  // Piece Highlighting for Computer's Move
  removeHighlights();
  $boardHighlighting
    .find(".square-" + mv.from)
    .addClass("highlight-" + squares[mv.from]);
  $boardHighlighting
    .find(".square-" + mv.to)
    .addClass("highlight-" + squares[mv.to]);

  if (mv.captured) captureAudio.play();
  else moveAudio.play();
});

socket.on("change", function (msg) {
  console.log("evento change:", msg);
  if (!msg.correct) {
    endAudio.play();
    userHistory.push({ puzzle: puzzle, correct: false });
    wrong++;
    $("#wrong").show();
    setTimeout(() => {
      $("#wrong").hide();
    }, 200);
  } else {
    confirmAudio.play();
    userHistory.push({ puzzle: data, correct: true });
    correct++;
    $("#correct").show();
    setTimeout(() => {
      $("#correct").hide();
    }, 200);
  }
  id++;
  puzzle = msg.puzzle;
  loadPuzzle();
});

function timer(puzzleEndDateTime, timerId) {
  let timeDifference = puzzleEndDateTime.getTime() - new Date().getTime();
  let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  if (timeDifference < 0) {
    gameOver(correct, timerId);
  }
  let mins = String(minutes);
  let secs = String(seconds);
  if (seconds < 10) secs = `0${secs}`;
  if (minutes === 0 && seconds === 30) {
    lowTimeAudio.play();
    $("#timer").css("color", "red");
  }
  $("#timer").text(`${mins}:${secs}`);
}

function setInfo() {
  data = puzzle;
  // Move Color
  $("#moveColor").text(
    `${data.color.charAt(0).toUpperCase() + data.color.slice(1)} To Move`
  );
  if (data.color === "black") {
    $(".moveColor").css("background-color", "#363236");
  } else {
    $(".moveColor").css("background-color", "#ececec");
  }
  // Score
  $("#score").text(correct);

  // Solved Puzzles
  if (id > 0) {
    let startFEN = userHistory[id - 1].puzzle.fen;
    let puzzleGame = new Chess(startFEN);
    puzzleGame.move(userHistory[id - 1].puzzle.start);
    let lichessPuzzleFEN = puzzleGame.fen().replace(/ /g, "%20");
    let elem;
    if (userHistory[id - 1].correct)
      elem = `<a href="https://lichess.org/analysis/${lichessPuzzleFEN}" target="_blank"><img class="marks" src="img/tick.svg"></img></a>`;
    else
      elem = `<a href="https://lichess.org/analysis/${lichessPuzzleFEN}" target="_blank"><img class="marks" src="img/cross.svg"></img></a>`;
    $("#solvedPuzzles").append(elem);

    // Generar los contadores de aciertos y fallos
    // Crear los elementos de enlace una sola vez si no están agregados
    if ($("#solvedCounter").children().length === 0) {
      const elem1 = `<a href="https://lichess.org/analysis/${lichessPuzzleFEN}" target="_blank"><img class="marks" src="img/tick.svg"></img></a><span class="counter-correct"></span>`;
      const elem2 = `<a href="https://lichess.org/analysis/${lichessPuzzleFEN}" target="_blank"><img class="marks" src="img/cross.svg"></img></a><span class="counter-incorrect"></span>`;
      $("#solvedCounter").append(elem1 + elem2);
    }
    // Actualizar contador junto a cada tipo de elemento
    if (userHistory[id - 1].correct) {
      $(".counter-correct").text(countCorrect());
    } else {
      $(".counter-incorrect").text(countIncorrect());
    }
  }
}

// Función para contar aciertos
function countCorrect() {
  let correctCount = 0;
  for (let i = 0; i < userHistory.length; i++) {
    if (userHistory[i].correct) {
      correctCount++;
    }
  }
  return correctCount;
}

// Función para contar fallos
function countIncorrect() {
  let incorrectCount = 0;
  for (let i = 0; i < userHistory.length; i++) {
    if (!userHistory[i].correct) {
      incorrectCount++;
    }
  }
  return incorrectCount;
}

function gameOver(correct, timerId) {
  socket.emit("end", { msg: "end" });
  console.log("Game Over!");
  gameOverAudio.play();
  clearInterval(timerId);
  $("#gameBoardDiv").hide();
  $("#moveColorDiv").hide();
  $("#gameOver").css("display", "flex");
  let text = "";
  if (correct < 5) text = "Bad Luck!";
  else if (correct < 10) text = "Keep Trying!";
  else if (correct < 20) text = "Nice One!";
  else if (correct < 30) text = "Amazing!";
  else text = "Excellent!";
  $("#scoreText").text(text);
}

function loadPuzzle() {
  data = puzzle;
  setInfo();
  if (wrong == 3) {
    gameOver(correct, timerId);
    return;
  }
  console.log(`Puzzle ID: ${String(data.id)}`);
  console.log(`Puzzle Rating: ${String(data.rating)}`);
  const startMove = data.start;
  const playing = true;
  let color = "white";
  game = new Chess(data.fen);

  function onDragStart(source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false;

    // only pick up pieces for the side to move
    if (
      !playing ||
      (game.turn() === "w" &&
        (piece.search(/^b/) !== -1 || color === "black")) ||
      (game.turn() === "b" &&
        (piece.search(/^w/) !== -1 || color === "white")) ||
      (color !== "black" && color !== "white")
    ) {
      return false;
    }
  }

  function onDrop(source, target) {
    // see if the move is legal
    const move = game.move({
      from: source,
      to: target,
      promotion: "q", // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return "snapback";

    socket.emit("move", { move: move.san });

    if (move.captured) captureAudio.play();
    else moveAudio.play();
  }

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  function onSnapEnd() {
    board.position(game.fen());
  }

  const config = {
    draggable: true,
    position: data.fen,
    onDragStart,
    onDrop,
    onSnapEnd,
    orientation: data.color,
  };
  board = Chessboard("myBoard", config);

  if (data.color === "white") color = "black";
  else color = "white";

  // Play First Move
  const mv = game.move(startMove);
  board.position(game.fen());

  if (color === "white") color = "black";
  else color = "white";

  // Piece Highlighting for first move
  removeHighlights();
  $boardHighlighting
    .find(".square-" + mv.from)
    .addClass("highlight-" + squares[mv.from]);
  $boardHighlighting
    .find(".square-" + mv.to)
    .addClass("highlight-" + squares[mv.to]);

  if (mv.captured) captureAudio.play();
  else moveAudio.play();
}
