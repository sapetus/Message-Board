const Message = require('../../models/Message')
const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const User = require('../../models/User')

const { UserInputError } = require('apollo-server-express')

const message = {
  Query: {
    userMessagesAmount: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const messages = await Message.find({ user: user.id })
      return messages.length
    },
    userMessages: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const messages = await Message.find({ user: user.id })
        .populate({ path: 'user', model: 'User' })
        .populate({ path: 'comment', model: 'Comment' })
        .populate({ path: 'post', model: 'Post' })

      return messages
    }
  },
  Mutation: {
    createMessage: async (root, args) => {
      const user = await User.findOne({ _id: args.userId })
      if (!user) {
        throw new UserInputError('User must exists to be able to send message', {
          invalidArgs: args.userId
        })
      }

      const post = await Post.findOne({ _id: args.postId })
      const comment = await Comment.findOne({ _id: args.commentId })

      if (!post && !comment) {
        throw new UserInputError('Message needs to have a comment or post associated with it', {
          invalidArgs: [args.postId, args.commentId]
        })
      }

      const newMessage = new Message({
        user: args.userId,
        comment: args.commentId,
        post: args.postId,
        seen: false
      })

      try {
        await newMessage.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      return newMessage
    },
    deleteMessage: async (root, args) => {
      const message = await Message.findOneAndRemove({ _id: args.id })
      return message
    },
    messageAcknowledged: async (root, args) => {
      const message = await Message.findOneAndUpdate({ _id: args.id }, { seen: true }, { new: true })
      return message
    }
  }
}

module.exports = message