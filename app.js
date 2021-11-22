const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

/************************** Server Configs ************************************/

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

/************************** Mongo scheme and models ************************************/

mongoose
  .connect(process.env.MONGODB_URL)
  .then((_) => console.log("Connected to mongoDB"));

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

/************************** Routes ************************************/

app.get("/", (req, res) => res.render("home"));

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

// Starting the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
