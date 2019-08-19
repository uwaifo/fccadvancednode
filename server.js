'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const cors = require('cors');
// imports for session and authentication
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

//
const mongo = require('mongodb').MongoClient;

const objectId = require('mongodb').ObjectID;

const app = express();
///
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// start configure session
require('dotenv').config(); // used to load .env variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
// end configure session

// require('dotenv').config();
mongo.connect(process.env.ATLAS_DATABASE_2, (err, db) => {
  if (err) {
    console.log('Database error : ' + err);
  } else {
    console.log('Successfully connected');
    //serialization and app.listen
    //  START serialize and deserialize authetication objects
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
      db.collection('users').findOne({ _id: new objectId(id) }, (err, doc) => {
        if (err) {
          return done(err);
        }
        return done(null, doc);
      });
    });

    //passport strategy
    passport.use(
      new LocalStrategy((username, password, done) => {
        db.collection('user').findOne({ username: username }, (err, user) => {
          console.log('User ' + username + ' attempted to log in . . .');
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          if (password !== user.password) {
            return done(null, false);
          }
          return done(null, user);
        });
      })
    );

    //END
    // Listen & Serve
    app.listen(process.env.PORT || 3000, () => {
      console.log('Listening on port ' + process.env.PORT);
    });
  }
});

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.route('/').get((req, res) => {
  //let userName = req.query.name;
  let payload = {
    title: `Home Page`,
    message: 'Please Login',
    showLogin: true
  };
  res.render(process.cwd() + '/views/pug/index', payload);
  //res.sendFile(process.cwd() + '/views/index.html');
});

app
  .route('/login')
  .post(
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );

app.route('/profile').get((req, res) => {
  res.render(process.cwd() + '/views/pug/profile');
});

// require('dotenv').config();
// https://www.freecodecamp.org/forum/t/advanced-node-and-express-implement-the-serialization-of-a-passport-user/246316/3
