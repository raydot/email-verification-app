var mongoose = require('mongoose')

// For later use, if needed
var schemaOptions = {}

// We need a way to distinguish which users have been verified.
// Notice the default value for isVerified is false.

var userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  roles: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  password: String,
  passResetToken: String,
  passwordResetExpires: Date
}, schemaOptions)
