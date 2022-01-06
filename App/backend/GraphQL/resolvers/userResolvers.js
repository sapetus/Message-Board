require('dotenv').config()

const { UserInputError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../../models/User')

const JWT_SECRET = process.env.JWT_SECRET
const saltRounds = 10

const userResolvers = {
  Query: {
    getCurrentUser: (root, args, context) => {
      return context.currentUser
    },
    getUserByName: async (root, args) => {
      const user = await User.findOne({ username: args.username })
        .populate({
          path: 'posts',
          model: 'Post',
          populate: {
            path: 'discussion'
          }
        })
        .populate({
          path: 'comments',
          model: 'Comment',
          populate: {
            path: 'post',
            populate: {
              path: 'discussion'
            }
          }
        })
        .populate({
          path: 'memberOf',
          model: 'Discussion'
        })
        .populate({
          path: 'postLikes',
          model: 'Post'
        })
        .populate({
          path: 'postDislikes',
          model: 'Post'
        })

      if (!user) {
        throw new UserInputError("No user with given name", {
          invalidArgs: args
        })
      }

      return user
    }
  },
  Mutation: {
    createUser: async (root, args) => {
      const username = args.username
      const passwordHash = bcrypt.hashSync(args.password, saltRounds)

      const newUser = new User({ username, passwordHash, posts: [], comments: [], memberOf: [] })

      try {
        await newUser.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      return newUser
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username }).select('+passwordHash')

      if (!user || !bcrypt.compareSync(args.password, user.passwordHash)) {
        throw new UserInputError('Wrong Credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

module.exports = userResolvers