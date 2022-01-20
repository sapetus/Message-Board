require('dotenv').config()

const { UserInputError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../../models/User')

const JWT_SECRET = process.env.JWT_SECRET
const saltRounds = 10

const user = {
  Query: {
    getCurrentUser: (root, args, context) => {
      return context.currentUser
    },
    getUserByName: async (root, args) => {
      //maybe it would be better idea to chop this up in to multiple queries for pagination 
      //i.e. findPostsByUser, findCommentsByUser etc...
      const user = await User.findOne({ username: args.username })
        .populate({
          path: 'postLikes',
          model: 'Post'
        })
        .populate({
          path: 'postDislikes',
          model: 'Post'
        })
        .populate({
          path: 'commentLikes',
          model: 'Comment'
        })
        .populate({
          path: 'commentDislikes',
          model: 'Comment'
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

      const newUser = new User({
        username,
        passwordHash,
        posts: [],
        comments: [],
        memberOf: [],
        totalLikes: 0,
        totalDislikes: 0,
        creationDate: new Date().toISOString()
      })

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

module.exports = user