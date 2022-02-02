const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  description: {
    type: String,
    required: true
  },
  members: {
    type: Number
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  listOfMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
})

schema.plugin(uniqueValidator)
module.exports = mongoose.model('Discussion', schema)