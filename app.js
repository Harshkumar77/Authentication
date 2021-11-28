const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const salt = require("./salt");

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
  saltKey: {
    required: true,
    type: String,
  },
});
const googleUserSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  googleID: {
    required: true,
    type: String,
  },
});

const User = mongoose.model("user", usersSchema);
const GoogleUser = mongoose.model("googleUser", googleUserSchema);

const auth = (username, password, done) => {
  User.findOne({ email: username })
    .exec()
    .then((doc) => {
      if (!doc) return done(null, false);
      if (
        salt.reverseSalting(
          process.env.SALTING_ROUND,
          password,
          doc.saltKey
        ) === doc.password
      )
        return done(null, doc);
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
passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    (token, tokenSecret, profile, done) => {
      GoogleUser.findOne({ googleID: profile.id })
        .exec()
        .then((doc) => {
          if (doc) {
            done(null, doc);
          } else {
            const newUser = new GoogleUser({
              name: profile.displayName,
              googleID: profile.id,
            });
            newUser
              .save()
              .then((doc) => done(null, doc))
              .catch((err) => done(err));
          }
        })
        .catch((err) => done(err));
      console.log(profile);
    }
  )
);
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
  if (req.user) res.redirect("secret");
  else res.render("home");
});
app
  .route("/register")
  .get((req, res) => {
    if (req.user) return res.redirect("/secret");
    res.render("register");
  })
  .post((req, res) => {
    const enc = salt.salting(process.env.SALTING_ROUND, req.body.password);
    new User({ email: req.body.email, password: enc[0], saltKey: enc[1] })
      .save()
      .then((doc) => {
        req.logIn(doc, (err) => {
          if (err) console.error(err);
        });
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
    if (req.user) res.redirect("secret");
    else res.render("login");
  })
  .post(
    passport.authenticate("local", {
      successRedirect: "/secret",
      failureRedirect: "/login",
    })
  );

app.get("/secret", (req, res) => {
  console.log(req.user);
  if (req.isAuthenticated()) res.render("secret");
  else res.redirect("/login");
});

app.post("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/secret",
  })
);

// Starting the server on port
app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
