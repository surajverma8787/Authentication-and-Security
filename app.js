require("dotenv").config();
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const passportLocal = require("passport-local");
mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "This is my Secret.",
    resave: false,
    saveUninitialized: false

}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function (req, res) {
    res.render("home.ejs");
});
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect("/");
});
app.route("/login")
    .get(function (req, res) {
        res.render("login.ejs");
    })
    .post(function (req, res) {
        const username = req.body.username;
        const password = (req.body.password);
        const user = new User(
            {
                username: username,
                password: password
            }
        );
        req.login(user, function (err) {
            if (err)
                console.log(err);
            else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                });
            }
        })
    });
app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    }
    else {
        res.redirect("/login");
    }
});
app.route("/register")
    .get(function (req, res) {
        res.render("register.ejs");
    })
    .post(function (req, res) {
        User.register({ username: req.body.username }, req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register");
            }
            else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                });
            }
        })
    });
app.listen(3000, function () {
    console.log("Server Started");
});
