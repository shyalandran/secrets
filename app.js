//jshint esversion:6
// require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require('md5');

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://127.0.0.1:27017/userDB');
const userSchema = mongoose.Schema({
    email: String,
    password: String
});

// var secret = "iamaprodeveloper!!bro.";
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/register", (req, res) => {
    const newUser = new User ({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save().then(() => {
        res.render("secrets.ejs");
    }).catch((err) => {
        console.log(err);
    }); 
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password);

    User.findOne({email: username}).then((foundUser) => {
        if (foundUser.password === password) {
            res.render("secrets.ejs")
        } else {
            console.log("password not mached");
        }
    }).catch((err) => {
        console.log(err);
    });
});


app.listen(port, () => {
    console.log(`server is running on port ${port}.`);
})

