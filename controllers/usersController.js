// import user Schema
// import token Schema

// Model = how the routes display
var User = require('../models/user')
var Token = require('../models/token')

// Controller = what the routes DO.
exports.index = function (req, res, next) {
  res.render('index', { title: 'User Home' })
}

exports.loginPost = function (req, res, next) {
  res.send('NOT WORKING YET: loginpost')
}

exports.confirmationPost = function (req, res, next) {
  res.send('NOT WORKING YET: confirmationPost')
}

exports.resendTokenPost = function (req, res, next) {
  res.send('NOT WORKING YET: resendTokenPost')
}

exports.signupPost = function (req, res, next) {
  res.send('NOT WORKING YET: signupPost')
}

exports.calvinPost = function (req, res, next) {
  res.send('<h1>Calvin rules!</h1>')
}
