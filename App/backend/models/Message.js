const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  responseTo: {
    type: String,
    enum: ['POST', 'COMMENT'],
    default: 'POST'
  },
  seen: {
    type: Boolean
  }
})

module.exports = mongoose.model('Message', schema)