const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config()
// const encrypt = require("mongoose-encryption");
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


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
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// var secret = "iamaprodeveloper!!bro.";
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets page.
    res.redirect('/secrets');
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

