var express = require('express')
var router = express.Router()

var usersController = require('../controllers/usersController.js')
const { check, validationResult } = require('express-validator/check')

// routes and validation (if any) go here:

router.get('/', usersController.index)

// confirm email address
router.post('/confirmation', usersController.confirmationPost)

// resend authentication email
router.post('/resend', usersController.resendTokenPost)

router.post('/signup', usersController.signupPost)

// login
// router.post('/login', usersController.loginPost)

router.post(
  '/login',
  usersController.validate('loginPost'),

  usersController.loginPost
)

// router.post('/login', [
//   check('email', 'You must supply an email address').not().isEmpty()
// ], (req, res, next) => {
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     console.log('ERRORS! ', { errors: errors.array })
//     return res.status(422).send({ errors: errors.array })
//   } else {
//     usersController.loginPost(req, res)
//   }
// })

router.get('/calvin', usersController.calvinPost)

module.exports = router
