//jshint esversion:6
// require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require('md5');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

const saltRounds = 10;

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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User ({
            email: req.body.username,
            password: hash  //"md5()"
        });
        newUser.save().then(() => {
            res.render("secrets.ejs");
        }).catch((err) => {
            console.log(err);
        }); 
    });
    
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password; //md5()

    User.findOne({email: username}).then((foundUser) => {
        bcrypt.compare(password, foundUser.password, function(err, result) {
            if ( result === password) {
                res.render("secrets.ejs");
            }
        });
    }).catch((err) => {
        console.log(err);
    });
});


app.listen(port, () => {
    console.log(`server is running on port ${port}.`);
})

