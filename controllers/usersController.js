// Helper Packages
var crypto = require('crypto')
var nodemailer = require('nodemailer')

var mongoose = require('mongoose')

// Validation
const { body, validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')

// Model = how the routes display
var User = require('../models/user')
var Token = require('../models/token')

// Controller = what the routes do

// Generic leftover route
exports.index = function (req, res, next) {
  res.render('index', { title: 'User Home' })
}

// Some logic to ensure all users have been verified.  If a user has not been
// verified, return a status code of (401) Unauthorized with the appropriate
// message

// when a user signs up, instead of logging them in immediately we send them a confirmation email
exports.signupPost = function (req, res, next) {
  // VALIDATE
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  console.log('NO ERRORS FOUND!')

  // GOOD TO GO!
  User.findOne({ email: req.body.email }, function (err, user) {
    // Make sure user doesn't already exist

    if (user) { return res.status(400).send({ msg: 'The email address you have entered is already associated with an account' }) }

    // Create and save the user
    user = new User({ name: req.body.name, email: req.body.email, password: req.body.password })
    user.save(function (err) {
      if (err) { return res.status(500).send({ msg: err.message }) }

      // create verification token for this user
      var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') })

      // save the verification token
      token.save(function (err) {
        if (err) { return res.status(500).send({ msg: err.message }) }

        // Send the email
        // removed the service: 'Sendgrid' from createTransport since we're not using sendgrid.
        var transporter = nodemailer.createTransport({ host: 'smtp.mailtrap.io', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } })
        var mailOptions = { from: 'no-reply@mytestapp.com', to: user.email, subject: 'Account Verification Token', text: 'Greetings,\n\n' + 'Verify by clicking \nhttp:\/\/' + req.headers.host + '\/users\/confirmation\/' + token.token + '\n' }
        transporter.sendMail(mailOptions, function (err) {
          if (err) { return res.status(500).send({ msg: err.message }) }
          res.status(200).send('Email on the way!  Sent to: ' + user.email + '.')
        }) // transporter
      }) // token.save
    }) // user.save
  }) // User.findOne
} // exports.signupPost

// This uses token based authentication.  It could be easy to change the code to
// use passport instead
exports.loginPost = function (req, res, next) {
  // VALIDATE
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  // GOOD TO GO!

  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) { return res.status(401).send({ msg: 'The email address ' + req.body.email + ' is not associated with any account.  Please try again.' }) }

    user.comparePassword(req.body.password, function (err, isMatch) {
      // console.log('PTC: ' + req.body.password)
      if (!isMatch) { return res.status(401).send({ msg: 'Invalid password' }) }

      // Make sure the user has been verified
      if (!user.isVerified) { return res.status(401).send({ type: 'not-verified', msg: 'Your account has not been verified!' }) }
      // Login successful!  Write token, and send back user
      res.send({ token: generateToken(user), user: user.toJSON() }) // generateToken is not defined!
    })// user.comparePassword
  }) // User.findOne
} // exports.login

// This needs a function for confirming verification tokens.
// Based on the TTL in the model verification tokens will automatically
// delete themselves after a set period of time.

/*  For an extra layer of security, I prefer to have the confirmation link take the user to a token confirmation form. The user would be asked to provide their email. The confirmation token would be embedded in this form as a hidden input. The submission of this form would post to confirmationPost below. For brevity’s sake, this confirmation form is not included in this tutorial.

If you prefer, you can have the user automatically confirm the token by clicking the link, but the action below would need to become a Get, instead of a Post.
*/

exports.confirmationPost = function (req, res, next) {
  // VALIDATE
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  // console.log('NO ERRORS FOUND!')

  // GOOD TO GO!

  // Find a matching token
  Token.findOne({ token: req.body.token }, function (err, token) {
    if (!token) { return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token.  Your token may have expired.  Please request another one.' }) }

    // If we do find a token, find a matching user!
    User.findOne({ _id: token._userId, email: req.body.email }, function (err, user) {
      if (!user) { return res.status(400).send({ msg: 'We are unable to find a user for this token' }) }
      if (user.isVerified) { return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified' }) }

      // Token good, user good, let's do this thing!
      user.isVerified = true
      user.save(function (err) {
        if (err) { return res.status(500).send({ msg: err.message }) }
        res.status(200).send('Your account has been verified!  Please log in!')
      }) // iser.save
    })// User.findOne
  }) // Token.findOne
}

// It's inevitable that some users will not be able to verify their account before their token expires.
// Let's help 'em out!
exports.resendTokenPost = function (req, res, next) {
  // VALIDATE
  const errors = validationResult(req)
  // console.log('errors.isEmpty()', !errors.isEmpty())
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  // GOOD TO GO

  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' })
    if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' })

    // Create a new token, save it, and send email
    var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') })

    // Save the token
    token.save(function (err) {
      if (err) { return res.status(500).send({ msg: err.message }) }

      // Send the email!

      var transporter = nodemailer.createTransport({ host: 'smtp.mailtrap.io', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } })
      var mailOptions = { from: 'no-reply@mytestapp.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/users\/confirmation\/' + token.token + '.\n' }

      transporter.sendMail(mailOptions, function (err) {
        if (err) { return res.status(500).send({ msg: err.message }) }
        res.status(200).send('A verification email has been sent to ' + user.email + '.')
      }) // transporter
    }) // token.save
  }) // User.findone
} // resendTokenPost

// What needs to be validated
exports.validate = (method) => {
  // console.log(method)
  switch (method) {
    case 'signupPost' : {
      return [
        body('name').exists().withMessage('Name missing'),
        body('email').exists().withMessage('Email missing'),
        body('email').isEmail().withMessage('Email invalid'),
        body('password').isLength({ min: 5, max: 256 }).withMessage('Email wrong number of characters'),
        body('password').exists().withMessage('Password missing'),
        sanitizeBody('email').normalizeEmail({ gmail_remove_dots: false })
      ]
      break
    }
    case 'loginPost': {
      return [
        body('email').exists().withMessage('Email missing'),
        body('email').isEmail().withMessage('Email invalid'),
        body('password').exists().withMessage('Password missing'),
        sanitizeBody('email').normalizeEmail({ gmail_remove_dots: false })
      ]
      break
    }
    case 'confirmationPost' : {
      return [
        body('email').exists().withMessage('Email missing'),
        body('email').isEmail().withMessage('Email invalid'),
        body('token').exists().withMessage('Token missing'),
        sanitizeBody('email').normalizeEmail({ gmail_remove_dots: false })
      ]
      break
    }
    case 'resendTokenPost' : {
      return [
        body('email').exists().withMessage('Email missing'),
        body('email').isEmail().withMessage('Email invalid'),
        sanitizeBody('email').normalizeEmail({ gmail_remove_dots: false })
      ]
    }
    default:
      var e = new Error('This condition is unreachable, so something is really wrong with userController.js')
      throw e
      console.error(e.lineNumber)
  } // switch
} // exports.validate

exports.generateToken = function (user) {
  console.log('token generated for:', user)
}

exports.dataDump = function (req, res, next) {
  // just dump all of the data
}

exports.calvinPost = function (req, res, next) {
  res.send('<h1>Calvin rules!</h1>')
}
