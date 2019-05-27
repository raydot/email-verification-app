var mongoose = require('mongoose')

var Schema = mongoose.Schema

var bcrypt = require('bcrypt')

var SALT_WORK_FACTOR = 10

// For later use, if needed
var schemaOptions = {}

// We need a way to distinguish which users have been verified.
// Notice the default value for isVerified is false.

var userSchema = Schema({
  name: String,
  email: { type: String, unique: true },
  roles: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  password: { type: String, index: { unique: true } },
  passResetToken: String,
  passwordResetExpires: Date
}, { schemaOptions, collection: 'user' })

userSchema.pre('save', function (next) {
  var user = this

  // only hash the passwowrd if it is new or modified
  if (!user.isModified('password')) return next()

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err)

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)

      // swap the cleartext password for the hashed one
      user.password = hash
      next()
    })
  }) // bcrypt.genSalt
}) // pre.save

userSchema.methods.comparePassword = function (testPW, cb) {
  bcrypt.compare(testPW, this.password, function (err, isMatch) {
    cb(null, isMatch)
  })
}

module.exports = mongoose.model('User', userSchema)
