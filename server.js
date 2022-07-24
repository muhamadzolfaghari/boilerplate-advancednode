"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const pug = require("pug");
const path = require("path");
const session = require("express-session");
const myDataBase = require("mongodb");
const ObjectID = require("mongodb").ObjectID;
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const routes = require("./routes");
const auth = require("./auth");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
fccTesting(app); //For FCC testing purposes

app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");
// app.set('views/pug', path.join(__dirname, 'views', 'pug'))

const MongoStore = require("connect-mongo")(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "express.sid",
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");

  // Be sure to change the title

  // Serialization and deserialization here...

  app.use((req, res, next) => {
    res.status(404).type("text").send("Not Found");
  });

  routes(app, myDataBase);
  auth(app, myDataBase);

  let socket = io();
  io.connect("http://localhost/auth/github/callback");
  io.on("connection", (socket) => {
    console.log("A user has connected");
    let currentUsers = 0;
    ++currentUsers;
    io.emit("user count", currentUsers);
  });
  socket.on("disconnect", () => {
    /*anything you want to do on disconnect*/
  });
  // Be sure to add this...
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("pug", { title: e, message: "Unable to login" });
  });
});

// app.route('/').get((req, res) => {
//   res.render(path.join(__dirname, 'views/pug/index'), {title: 'Hello', message: 'Please login'});
// });

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
