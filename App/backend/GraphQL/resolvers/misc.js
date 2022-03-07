const Message = require('../../models/Message')
const Discussion = require('../../models/Discussion')
const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const User = require('../../models/User')

const misc = {
  Mutation: {
    clearDatabase: async (root, args) => {
      const { deletedCount: messages } = await Message.deleteMany({})
      const { deletedCount: discussions } = await Discussion.deleteMany({})
      const { deletedCount: comments } = await Comment.deleteMany({})
      const { deletedCount: posts } = await Post.deleteMany({})
      const { deletedCount: users } = await User.deleteMany({})

      const deletedItems = {
        messages, discussions, comments, posts, users
      }

      return deletedItems
    }
  }
}

module.exports = misc