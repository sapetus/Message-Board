const { UserInputError } = require('apollo-server-express')

const Message = require('../../models/Message')
const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const User = require('../../models/User')
const { paginate } = require('../utils')

const message = {
  Query: {
    userNewMessagesAmount: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user) {
        throw new UserInputError('No user found with given name', {
          invalidArgs: args.username
        })
      }

      const messages = await Message.find({ user: user.id, seen: false })
      return messages.length
    },
    userMessagesAmount: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user) {
        throw new UserInputError('No user found with given name', {
          invalidArgs: args.username
        })
      }

      const messages = await Message.find({ user: user.id })
      return messages.length
    },
    userMessages: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user) {
        throw new UserInputError('No user found with given name', {
          invalidArgs: args.username
        })
      }

      const messages = await Message.find({ user: user.id })
        .populate({ path: 'user', model: 'User' })
        .populate({ path: "responder", model: 'User' })
        .populate({
          path: 'comment', model: 'Comment',
          populate: {
            path: "post", model: "Post",
            populate: {
              path: "discussion", model: "Discussion"
            }
          }
        })
        .populate({
          path: 'post', model: 'Post',
          populate: {
            path: 'discussion', model: "Discussion"
          }
        })

      const paginatedMessages = paginate(messages, args.first, args.after)

      //return messages in order of creation (new first)
      return paginatedMessages.reverse()
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
        responder: args.responderId,
        comment: args.commentId,
        post: args.postId,
        seen: false,
        responseTo: args.responseTo
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
    deleteAllMessagesForUser: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user) {
        throw new UserInputError('User must exist to be able to delete their messages', {
          invalidArgs: args.username
        })
      }

      const { deletedCount } = await Message.deleteMany({ user: user.id })
      return deletedCount
    },
    messageAcknowledged: async (root, args) => {
      const message = await Message.findOneAndUpdate({ _id: args.id }, { seen: true }, { new: true })
      return message
    }
  }
}

module.exports = message