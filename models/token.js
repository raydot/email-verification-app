var mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
  _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
}, { collection: 'token' })

module.exports = mongoose.model('Token', tokenSchema)
/*
  There are a couple of interesting points regarding our verification tokens
    * Not surprisingly, you will need to provide the userId of the user the token is issued

    * There is a feature in Mongo called "expires" that sets a document TTL.  Here
      the TTL is set to 43200 or 12 hours.  Then the verification token expires.
*/
