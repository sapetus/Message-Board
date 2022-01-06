const { UserInputError } = require('apollo-server')

const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const User = require('../../models/User')

const { checkUser } = require('../utils')

const commentResolvers = {
  Mutation: {
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
    }
  }
}

module.exports = commentResolvers