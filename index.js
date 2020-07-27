var express = require('express');
var session = require('express-session')
var mongoose = require('mongoose');
var pug = require('pug');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

var User = require('./models/User');

var app = express();
var db = mongoose.connect('mongodb://localhost:27017/MySocialNetwork');

var authenticated = function(request, response, next) {
  if(request.session && request.session.user) return next();
  return response.redirect('/login')
}

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({ secret: 'HDZHDZ', saveUninitialized: true, resave: true}))

app.get('/', function(request, response) {
    response.render('index', {title: 'home'});
});

app.get('/login', function(request, response) {
    response.render('login', {title: 'login'});
});

app.post('/login', function(request, response){
  User.findOne({username: request.body.username}, function(error, user) {
    if (error) return response.render('error', {error: error, title: 'error'});
    if(!user) return response.render('error', {error: 'user does not exist'});
    if (user.compare(request.body.password)) {
      console.log('logged in as: ' +user.username)
      request.session.user = {user};
      response.redirect('/me')
    } else {
      return response.render('error', {error: 'Incorrect credentials', title: 'error'})
    }
  })
});
app.get('/me', authenticated, function(request, response) {
  response.send(request.session.user)
})
app.get('/register', function(request, response) {
    response.render('register', {title: 'register'});
});

app.post('/register', function(request, response){
  if (request.body.username && request.body.password){
    User.create({
      username:request.body.username,
      password: request.body.password
    }, function(error, user){
      if (error){
        response.render('error', {
          title: 'error',
          error: 'user was not created for some reasons'
        })
      } else {
        response.send(user)
      }
    });
  } else {
    response.render('error',
    {
      title: 'error',
      error:'Username or Password required'});
  }
});

app.get('/users.json', function(request, response) {
  User.find({}, function(error, users) {
    if (error) throw console.error();

    response.send(users)
  })
})

app.listen(2508);
