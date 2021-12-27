const mongoose = require('mongoose')

const schema = mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 5,
    maxLength: 500
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
  }
})

module.exports = mongoose.model('Comment', schema)