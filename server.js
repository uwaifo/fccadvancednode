'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');


// imports for session and authentication
const session = require('express-session');
const passport = require('passport');

const db = require('mongodb').MongoClient;
const objectId = require('mongodb').OnjectID;



const app = express();


//configure session
//require('dotenv').config();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session())
// end configure session

//  START serialize and deserialize authetication objects
//serialize
passport.serializeUser((user, done) => {
  done(null, user._id);
});
//deserialize
passport.deserializeUser((id, done) => {
  /*db.collection('user').findOne({ _id: new objectId(id) }, (err, doc) => {
    return done(null, null);
  });*/
  return done(null, null);
});
//END

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.route('/')
  .get((req, res) => {
  let payload = {
    title: 'Hello',
    message: 'Please Login'
  }
    res.render(process.cwd() + '/views/pug/index', payload);
    // res.sendFile(process.cwd() + '/views/index.html');
  });

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
