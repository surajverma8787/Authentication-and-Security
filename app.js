require("dotenv").config();
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
const User = mongoose.model("User", userSchema);
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", function (req, res) {
    res.render("home.ejs");
});
app.route("/login")
    .get(function (req, res) {
        res.render("login.ejs");
    })
    .post(function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({ email: username }, function (err, foundUser) {
            if (!err) {
                if (foundUser.password == password)
                    res.render("secrets.ejs");
                else
                    res.send("User Not Found");
            }
            else
                res.render(err);
        })

    });
app.route("/register")
    .get(function (req, res) {
        res.render("register.ejs");
    })
    .post(function (req, res) {
        const user = new User({
            email: req.body.username,
            password: req.body.password
        });
        user.save(function (err) {
            if (!err)
                res.render("secrets.ejs");
            else
                res.send(err);

        });
    });
app.listen(3000, function () {
    console.log("Server Started");
});
