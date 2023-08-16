require("dotenv").config();
const http = require("http");
const express = require("express");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const server = http.createServer(app);
const session = require("express-session");
const router = require("./routes/router.js");
const setupWs = require("./helpers/ws.js");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const Chess = require("chess.js").Chess;
const pug = require("pug");
/*
// Rate Limiter Setup
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "You have been rate limited."
});
app.use(limiter);
*/
//DB Connection
mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDB");
});
db.on("error", (err) => {
  console.log(err);
});

app.set("view engine", "pug");
app.set("views", "./static");

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("static"));

// Configura express-session
// Configuración de la sesión
const sessionMiddleware = session({
  secret: "your_secret_key", // Replace with your actual secret key
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: "/",
    httpOnly: true,
    secure: false,
    // Set the maximum age of the session (in milliseconds) to 1 hour (for example)
    maxAge: 60 * 60 * 1000,
  },
});

app.use(sessionMiddleware);
app.use("/", router);
setupWs(server, sessionMiddleware);

// Heroku deploy
const host = "0.0.0.0";

server.listen(port, host, () => {
  console.log(`Chess10x Server ready.`);
});
