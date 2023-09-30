// require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
const port = 3000;

// const saltRounds = 10; //bcrypt

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'iamaprodeveloper!!bro.',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session()); 

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// var secret = "iamaprodeveloper!!bro.";
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets.ejs");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.log(err);
        }else {
            res.redirect('/');
        }
    });
});

app.post("/register", (req, res) => {
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User ({
    //         email: req.body.username,
    //         password: hash  //"md5()"
    //     });
    //     newUser.save().then(() => {
    //         res.render("secrets.ejs");
    //     }).catch((err) => {
    //         console.log(err);
    //     }); 
    // });

    User.register({username:req.body.username, active: false}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }else {
            passport.authenticate("local") (req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req, res) => {
    // const username = req.body.username;
    // const password = req.body.password; //md5()
    // User.findOne({email: username}).then((foundUser) => {
    //     if (foundUser) {
    //         bcrypt.compare(password, foundUser.password, function(err, result) {
    //         if ( result === true) {
    //             res.render("secrets.ejs");
    //         }else {
    //             console.log("incorrect password");
    //         }
    //     });
    //     }else {
    //         console.log("email not founded");
    //     }
    // }).catch((err) => {
    //     console.log(err);
    // });

    const user = new User ({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err); 
        }else {
            passport.authenticate("local") (req, res, () => {
                res.redirect("/secrets");
            });
        } 
      });

});


app.listen(port, () => {
    console.log(`server is running on port ${port}.`);
})

