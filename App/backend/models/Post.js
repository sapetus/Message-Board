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
    maxlength: 500
  },
  likes: {
    type: Number
  },
  dislikes: {
    type: Number
  },
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
})

module.exports = mongoose.model('Post', schema)