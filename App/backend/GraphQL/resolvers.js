require('dotenv').config()

const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const Discussion = require('../models/Discussion')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET
const saltRounds = 10

const checkUser = (context) => {
  const currentUser = context.currentUser

  if (!currentUser) {
    throw new AuthenticationError("No Authentication")
  }

  return currentUser
}

const resolvers = {
  Query: {
    //no need to populate posts, as they are not needed in this query
    allDiscussions: async () => {
      const discussions = await Discussion.find({})

      return discussions
    },
    findDiscussion: async (root, args) => {
      const discussion = await Discussion.findOne({ name: args.name })
        .populate({ path: 'posts', model: 'Post' })

      return discussion
    },
    findPost: async (root, args) => {
      const post = await Post.findOne({ _id: args.id })
        .populate('discussion')
        .populate('user', '-passwordHash')
        .populate({ path: 'comments', model: 'Comment' })
      return post
    },
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
    },
    createDiscussion: async (root, args, context) => {
      checkUser(context)

      if (await Discussion.findOne({ name: args.name })) {
        throw new UserInputError('Name of the discussion must be unique', {
          invalidArgs: args.name
        })
      }

      const newDiscussion = new Discussion({ ...args, members: 0, posts: [] })

      try {
        await newDiscussion.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      return newDiscussion
    },
    createPost: async (root, args, context) => {
      const currentUser = checkUser(context)

      const discussion = await Discussion.findOne({ name: args.discussionName })

      if (!discussion) {
        throw new UserInputError('Discussion must exists to be able to post', {
          invalidArgs: args.discussionName
        })
      }

      const newPost = new Post({
        title: args.title,
        text: args.text,
        likes: 0,
        dislikes: 0,
        discussion: discussion,
        user: currentUser
      })

      try {
        await newPost.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      //update list of created posts for the user
      const usersPosts = currentUser.posts.concat(newPost)
      await User.findOneAndUpdate({ _id: currentUser.id }, { posts: usersPosts }, { new: true })

      //update the specified discussion's list of posts
      let posts = discussion.posts ? discussion.posts : []
      posts.push(newPost.id)
      await Discussion.findOneAndUpdate({ name: args.discussionName }, { posts: posts }, { new: true })

      return newPost
    },
    createComment: async (root, args, context) => {
      const currentUser = checkUser(context)

      const post = await Post.findOne({ _id: args.postId })

      if (!post) {
        throw new UserInputError('Post must exists to be able to comment', {
          invalidArgs: args.postId
        })
      }

      const newComment = new Comment({
        text: args.text,
        likes: 0,
        dislikes: 0,
        post: post,
        user: currentUser
      })

      try {
        await newComment.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      //update list of created comments for the user
      const usersComments = currentUser.comments.concat(newComment)
      await User.findOneAndUpdate({ _id: currentUser.id }, { comments: usersComments }, { new: true })

      //update the specified post's list of comments
      let comments = post.comments ? post.comments : []
      comments.push(newComment.id)
      await Post.findOneAndUpdate({ _id: args.postId }, { comments: comments }, { new: true })

      return newComment
    },
    likePost: async (root, args, context) => {
      checkUser(context)
      const updatedPost = await Post.findOneAndUpdate({ _id: args.id }, { $inc: { likes: 1 } }, { new: true })
      return updatedPost
    },
    dislikePost: async (root, args, context) => {
      checkUser(context)
      const updatedPost = await Post.findOneAndUpdate({ _id: args.id }, { $inc: { dislikes: 1 } }, { new: true })
      return updatedPost
    },
    likeComment: async (root, args, context) => {
      checkUser(context)
      const updatedComment = await Comment.findOneAndUpdate({ _id: args.id }, { $inc: { likes: 1 } }, { new: true })
      return updatedComment
    },
    dislikeComment: async (root, args, context) => {
      checkUser(context)
      const updatedComment = await Comment.findOneAndUpdate({ _id: args.id }, { $inc: { dislikes: 1 } }, { new: true })
      return updatedComment
    },
    subscribeToDiscussion: async (root, args, context) => {
      const currentUser = checkUser(context)
      const discussion = await Discussion.findOne({ name: args.discussionName })

      if (!discussion) {
        throw new UserInputError('Discussion must exist to be able to subscribe', {
          invalidArgs: args
        })
      }

      //add discussion to users list of subscriptions
      const usersSubscriptions = currentUser.memberOf.concat(discussion)
      await User.findOneAndUpdate({ _id: currentUser.id }, { memberOf: usersSubscriptions }, { new: true })

      //increment discussions member value
      const updatedDiscussion = await Discussion.findOneAndUpdate({ name: args.discussionName }, { $inc: { members: 1 } }, { new: true })

      return updatedDiscussion
    }
  }
}

module.exports = resolvers