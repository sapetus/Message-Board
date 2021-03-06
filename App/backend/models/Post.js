const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100
  },
  text: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1500
  },
  image: {
    type: String
  },
  likes: {
    type: Number
  },
  dislikes: {
    type: Number
  },
  amountOfComments: {
    type: Number
  },
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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

module.exports = mongoose.model('Post', schema)