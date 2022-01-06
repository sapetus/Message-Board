require('dotenv').config()

const { UserInputError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const Discussion = require('../models/Discussion')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const User = require('../models/User')

const { checkUser } = require('./utils')

const JWT_SECRET = process.env.JWT_SECRET
const saltRounds = 10

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
        .populate({ path: 'listOfMembers', model: 'User' })

      return discussion
    },
    findPost: async (root, args) => {
      const post = await Post.findOne({ _id: args.id })
        .populate('discussion')
        .populate('user', '-passwordHash')
        .populate({
          path: 'comments',
          model: 'Comment',
          populate: {
            path: 'user',
            model: 'User'
          }
        })
        .populate({
          path: 'listOfLikeUsers',
          model: 'User'
        })
        .populate({
          path: 'listOfDislikeUsers',
          model: 'User'
        })

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
      await User.findOneAndUpdate(
        { _id: currentUser.id },
        { comments: usersComments },
        { new: true }
      )

      //update the specified post's list of comments
      let comments = post.comments ? post.comments : []
      comments.push(newComment.id)
      await Post.findOneAndUpdate(
        { _id: args.postId },
        { comments: comments },
        { new: true }
      )

      return newComment
    }, // these are getting awfully long (slow? no idea, such a tiny dataset)
    likePost: async (root, args, context) => {
      const currentUser = checkUser(context)
      const post = await Post.findOne({ _id: args.id })
        .populate({
          path: 'listOfLikeUsers',
          model: 'User'
        })
        .populate({
          path: 'listOfDislikeUsers',
          model: 'User'
        })

      if (!post) {
        throw new UserInputError('Post must exist to be able to like it', {
          invalidArgs: args
        })
      }

      //check if user has already liked the post
      const usersPostLikes = currentUser.postLikes.map(post => post.id)
      const hasLiked = usersPostLikes.includes(args.id)

      if (hasLiked) {
        throw new UserInputError('User has already liked this post', {
          invalidArgs: args
        })
      }

      //check if the user has disliked the post
      const usersPostDislikes = currentUser.postDislikes.map(post => post.id)
      const hasDisliked = usersPostDislikes.includes(args.id)

      if (hasDisliked) {
        // if user has already disliked the post, remove it from users list of disliked posts and add it to list of liked posts
        // also remove user from posts list of dislike users and add user to list of like users
        const updatedListOfDislikeUsers = post.listOfDislikeUsers.filter(user => user.id !== currentUser.id)
        const updatedListOfLikeUsers = post.listOfLikeUsers.concat(currentUser)

        const updatedPost = await Post.findOneAndUpdate(
          { _id: args.id },
          {
            listOfLikeUsers: updatedListOfLikeUsers,
            listOfDislikeUsers: updatedListOfDislikeUsers,
            $inc: { dislikes: -1, likes: 1 }
          },
          { new: true }
        )

        const updatedPostDislikes = currentUser.postDislikes.filter(post => post.id !== args.id)
        const updatedPostLikes = currentUser.postLikes.concat(updatedPost)

        await User.findOneAndUpdate(
          { _id: currentUser.id },
          { postLikes: updatedPostLikes, postDislikes: updatedPostDislikes },
          { new: true }
        )

        return updatedPost
      } else {
        // if user has not disliked the post, add it to users list of liked posts
        // add user to posts list of like users
        const updatedListOfLikeUsers = post.listOfLikeUsers.concat(currentUser)

        const updatedPost = await Post.findOneAndUpdate(
          { _id: args.id },
          { listOfLikeUsers: updatedListOfLikeUsers, $inc: { likes: 1 } },
          { new: true }
        )

        const updatedPostLikes = currentUser.postLikes.concat(updatedPost)

        await User.findOneAndUpdate(
          { _id: currentUser.id },
          { postLikes: updatedPostLikes },
          { new: true }
        )

        return updatedPost
      }
    },
    dislikePost: async (root, args, context) => {
      const currentUser = checkUser(context)
      const post = await Post.findOne({ _id: args.id })
        .populate({
          path: 'listOfLikeUsers',
          model: 'User'
        })
        .populate({
          path: 'listOfDislikeUsers',
          model: 'User'
        })

      if (!post) {
        throw new UserInputError('Post must exist to be able to dislike it', {
          invalidArgs: args
        })
      }

      //check if user has already disliked the post
      const usersPostDislikes = currentUser.postDislikes.map(post => post.id)
      const hasDisliked = usersPostDislikes.includes(args.id)

      if (hasDisliked) {
        throw new UserInputError('User has already disliked this post', {
          invalidArgs: args
        })
      }

      //check if the user has liked the post
      const usersPostLikes = currentUser.postLikes.map(post => post.id)
      const hasLiked = usersPostLikes.includes(args.id)

      if (hasLiked) {
        // if user has already liked the post, remove the post from users list of liked post and add it to list of disliked posts
        // also remove user from posts list of like users and add user to list of dislike users
        const updatedListOfLikeUsers = post.listOfLikeUsers.filter(user => user.id !== currentUser.id)
        const updatedListOfDislikeUsers = post.listOfDislikeUsers.concat(currentUser)

        const updatedPost = await Post.findOneAndUpdate(
          { _id: args.id },
          {
            listOfLikeUsers: updatedListOfLikeUsers,
            listOfDislikeUsers: updatedListOfDislikeUsers,
            $inc: { likes: -1, dislikes: 1 }
          },
          { new: true }
        )

        const updatedPostLikes = currentUser.postLikes.filter(post => post.id !== args.id)
        const updatedPostDislikes = currentUser.postDislikes.concat(updatedPost)

        await User.findOneAndUpdate(
          { _id: currentUser.id },
          { postLikes: updatedPostLikes, postDislikes: updatedPostDislikes },
          { new: true }
        )

        return updatedPost
      } else {
        // if user has not liked the post, add it to the users list of disliked posts
        // also add user to posts list of dislike users
        const updatedListOfDislikeUsers = post.listOfDislikeUsers.concat(currentUser)

        const updatedPost = await Post.findOneAndUpdate(
          { _id: args.id },
          { listOfDislikeUsers: updatedListOfDislikeUsers, $inc: { dislikes: 1 } },
          { new: true }
        )

        const updatedPostDislikes = currentUser.postDislikes.concat(updatedPost)

        await User.findOneAndUpdate(
          { _id: currentUser.id },
          { postDislikes: updatedPostDislikes },
          { new: true }
        )

        return updatedPost
      }
    },
    likeComment: async (root, args, context) => {
      checkUser(context)
      const updatedComment = await Comment.findOneAndUpdate(
        { _id: args.id },
        { $inc: { likes: 1 } },
        { new: true }
      )
      return updatedComment
    },
    dislikeComment: async (root, args, context) => {
      checkUser(context)
      const updatedComment = await Comment.findOneAndUpdate(
        { _id: args.id },
        { $inc: { dislikes: 1 } },
        { new: true }
      )
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

      //Check if the user is already subscribed to this discussion
      const subscriptionNames = currentUser.memberOf.map(discussion => discussion.name)
      if (subscriptionNames.includes(args.discussionName)) {
        throw new UserInputError('User has already subscribed to this discussion', {
          invalidArgs: args
        })
      }

      //add discussion to users list of subscriptions
      const usersSubscriptions = currentUser.memberOf.concat(discussion)
      await User.findOneAndUpdate({ _id: currentUser.id }, { memberOf: usersSubscriptions }, { new: true })

      //update discussion
      const updatedMemberList = discussion.listOfMembers.concat(currentUser)
      const updatedDiscussion = await Discussion.findOneAndUpdate(
        { name: args.discussionName },
        { listOfMembers: updatedMemberList, $inc: { members: 1 } },
        { new: true }
      )

      return updatedDiscussion
    },
    unsubscribeFromDiscussion: async (root, args, context) => {
      const currentUser = checkUser(context)
      const discussion = await Discussion.findOne({ name: args.discussionName })

      if (!discussion) {
        throw new UserInputError('Discussion must exist to be able to unsubscribe', {
          invalidArgs: args
        })
      }

      //Check if the user is subscribed to this discussion
      const subscriptionNames = currentUser.memberOf.map(discussion => discussion.name)
      if (!subscriptionNames.includes(args.discussionName)) {
        throw new UserInputError('User is not subscribed to this discussion, cannot unsubscribe', {
          invalidArgs: args
        })
      }

      //remove discussion from users list of subscriptions
      const usersSubscriptions = currentUser.memberOf.filter(discussion => discussion.name !== args.discussionName)
      await User.findOneAndUpdate({ _id: currentUser.id }, { memberOf: usersSubscriptions }, { new: true })

      //update discussion
      const updatedMemberList = discussion.listOfMembers.filter(user => user.name !== currentUser.name)
      const updatedDiscussion = await Discussion.findOneAndUpdate(
        { name: args.discussionName },
        { listOfMembers: updatedMemberList, $inc: { members: -1 } },
        { new: true }
      )

      return updatedDiscussion
    }
  }
}

module.exports = resolvers