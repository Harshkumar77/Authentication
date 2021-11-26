const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

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

const User = mongoose.model("user", usersSchema);

const auth = (username, password, done) => {
  User.findOne({ email: username })
    .exec()
    .then((doc) => {
      if (!doc) return done(null, false);
      if (doc.password === password) return done(null, doc);
    })
    .catch((err) => {
      return done(err);
    });
};
app.use(
  require("express-session")({
    secret: "hello",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy({ usernameField: "email" }, auth));
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id)
    .exec()
    .then((doc) => done(null, doc));
});

/************************** Routes ************************************/

app.get("/", (req, res) => {
  if (req.user) res.render("secret");
  else res.render("home");
});
app
  .route("/register")
  .get((req, res) => {
    if (req.user) return res.redirect("/secret");
    res.render("register");
  })
  .post((req, res) => {
    new User(req.body)
      .save()
      .then((doc) => {
        req.logIn(doc, (err) => console.error(err));
        res.redirect("/secret");
      })
      .catch((err) => {
        console.error(err);
        res.redirect("/");
      });
  });

app
  .route("/login")
  .get((req, res) => {
    if (req.user) res.render("secret");
    else res.render("login");
  })
  .post(
    passport.authenticate("local", {
      successRedirect: "/secret",
      failureRedirect: "/login",
    })
  );

app.get("/secret", (req, res) => {
  if (req.user) res.render("secret");
  else res.redirect("/login");
});

app.post("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

// Starting the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
