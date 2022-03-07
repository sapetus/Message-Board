const mongoose = require('mongoose')

const schema = mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 5,
    maxLength: 1000
  },
  likes: {
    type: Number
  },
  dislikes: {
    type: Number
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  responseTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  listOfLikeUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  listOfDislikeUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
})

module.exports = mongoose.model('Comment', schema)