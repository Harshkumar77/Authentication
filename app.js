// Boiler plate

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
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
  },
  password: {
    required: true,
    type: String,
  },
});

usersSchema.plugin(encrypt, {
  secret: process.env.ENC_KEY,
  encryptedFields: ["password"],
});

// Routes

const User = new mongoose.model("user", usersSchema);

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
  .post((req, res) => {
    console.log(req.body);
    new User(req.body).save().then((doc) => {
      console.log(doc);
      ejs.renderFile(__dirname + "/ejs/secret.ejs", (err, str) => {
        res.send(str);
      });
    });
  });

app
  .route("/login")
  .get((req, res) => {
    ejs.renderFile(__dirname + "/ejs/login.ejs", (err, str) => {
      res.send(str);
    });
  })
  .post((req, res) => {
    console.log(req.body);
    User.findOne(req.body)
      .exec()
      .then((doc) => {
        if (doc)
          ejs.renderFile(__dirname + "/ejs/secret.ejs", (err, str) => {
            res.send(str);
          });
      });
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
