var express = require('express')
var router = express.Router()

var usersController = require('../controllers/usersController.js')
// const { check, validationResult } = require('express-validator/check')

// routes and validation
// Generic route
router.get('/', usersController.index)

// signup
router.post(
  '/signup',
  usersController.validate('signupPost'),
  usersController.signupPost
)

// login
router.post(
  '/login',
  usersController.validate('loginPost'),
  usersController.loginPost
)

// confirm email address
router.post(
  '/confirmation',
  usersController.validate('confirmationPost'),
  usersController.confirmationPost
)

// resend authentication email
router.post(
  '/resend',
  usersController.validate('resendTokenPost'),
  usersController.resendTokenPost
)

router.get('/calvin', usersController.calvinPost)

module.exports = router
