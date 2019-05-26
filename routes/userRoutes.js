var express = require('express')
var router = express.Router()

var usersController = require('../controllers/usersController.js')

// route/controller connections go here:

// these are routing to /users which I don't entirely understand.
router.get('/', usersController.index)
router.get('/confirmation', usersController.confirmationPost)
router.get('/resend', usersController.resendTokenPost)
router.get('/signup', usersController.signupPost)
router.get('/login', usersController.loginPost)
router.get('/calvin', usersController.calvinPost)

module.exports = router
