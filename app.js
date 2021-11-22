// Boiler plate

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then((_) => console.log("Connected to mongoDB"));

const app = express();

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
  saltKey: {
    required: true,
    type: String,
  },
});

const User = new mongoose.model("user", usersSchema);

// Routes

app.get("/", (req, res) =>
  ejs.renderFile(__dirname + "/ejs/home.ejs", (err, str) => res.send(str))
);

app
  .route("/register")
  .get((req, res) => {
    ejs.renderFile(__dirname + "/ejs/register.ejs", (err, str) => {
      res.send(str);
    });
  })
  .post((req, res) => {});

app
  .route("/login")
  .get((req, res) => {
    ejs.renderFile(__dirname + "/ejs/login.ejs", (err, str) => {
      res.send(str);
    });
  })
  .post((req, res) => {});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
