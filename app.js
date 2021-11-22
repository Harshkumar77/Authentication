// Boiler plate

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then((_) => console.log("Connected to mongoDB"));

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

// Mongo scheme and models

const usersSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    required: true,
    type: String,
  },
});

const User = new mongoose.model("user", usersSchema);

// Routes

app.get("/", (req, res) =>
  // ejs.renderFile(__dirname + "/ejs/home.ejs", (err, str) => res.send(str))
  res.render("home")
);

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
