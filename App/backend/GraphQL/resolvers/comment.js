const { UserInputError } = require('apollo-server')

const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const User = require('../../models/User')

const {
  checkUser,
  checkUserAction,
  paginate
} = require('../utils')

const comment = {
  Query: {
    findComment: async (root, args) => {
      const comment = await Comment.findOne({ _id: args.id })
        .populate('post')
        .populate('user')
        .populate({ path: 'listOfLikeUsers', model: 'User' })
        .populate({ path: 'listOfDislikeUsers', model: 'User' })

      return comment
    },
    findCommentsByPost: async (root, args) => {
      const post = await Post.findOne({ _id: args.id })
        .populate({
          path: 'comments',
          model: 'Comment',
          populate: [
            {
              path: 'user',
              model: 'User'
            },
            {
              path: 'listOfLikeUsers',
              model: 'User'
            },
            {
              path: 'listOfDislikeUsers',
              model: 'User'
            }
          ]
        })

      const comments = post.comments

      const paginatedComments = paginate(comments, args.first, args.after)

      return paginatedComments
    },
    findCommentsByUser: async (root, args) => {
      const user = await User.findOne({ username: args.username })
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
      
      const comments = user.comments

      const paginatedComments = paginate(comments, args.first, args.after)
      
      return paginatedComments
    }
  },
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
      const currentUser = checkUser(context)
      const comment = await Comment.findOne({ _id: args.id })
        .populate({ path: 'user', model: 'User' })
        .populate({ path: 'listOfLikeUsers', model: 'User' })
        .populate({ path: 'listOfDislikeUsers', model: 'User' })

      if (!comment) {
        throw new UserInputError('Comment has to exist to be able to like it', {
          invalidArgs: args
        })
      }

      //check if the user has already liked the comment
      const usersCommentLikes = currentUser.commentLikes.map(comment => comment.id)
      checkUserAction(usersCommentLikes, args, 'vote')

      //check if the use has disliked the comment
      const usersCommentDislikes = currentUser.commentDislikes.map(comment => comment.id)
      const hasDisliked = usersCommentDislikes.includes(args.id)

      if (hasDisliked) {
        //if user has already disliked the comment, remove comment from users list of disliked comments and add it to list of liked comments
        //also remove user from comments list of users who have disliked it and add user to list of users who have liked it
        //increment and decrement comment's creator's total likes/dislikes
        await User.findOneAndUpdate(
          { _id: comment.user._id },
          { $inc: { totalLikes: 1, totalDislikes: -1 } },
          { new: true }
        )

        const updatedListOfDislikeUsers = comment.listOfDislikeUsers.filter(user => user.id !== currentUser.id)
        const updatedListOfLikeUsers = comment.listOfLikeUsers.concat(currentUser)

        const updatedComment = await Comment.findOneAndUpdate(
          { _id: args.id },
          {
            listOfLikeUsers: updatedListOfLikeUsers,
            listOfDislikeUsers: updatedListOfDislikeUsers,
            $inc: { likes: 1, dislikes: -1 }
          },
          { new: true }
        )

        const updatedCommentDislikes = currentUser.commentDislikes.filter(comment => comment.id !== args.id)
        const updatedCommentLikes = currentUser.commentLikes.concat(updatedComment)

        await User.findOneAndUpdate(
          { _id: currentUser.id },
          {
            commentLikes: updatedCommentLikes,
            commentDislikes: updatedCommentDislikes
          },
          { new: true }
        )

        return updatedComment
      } else {
        //if user has not disliked the comment, add comment to users list of liked comments
        //also add user to comments list of users who have liked it
        //increment comment's creator's total likes
        await User.findOneAndUpdate(
          { _id: comment.user._id },
          { $inc: { totalLikes: 1 } },
          { new: true }
        )

        const updatedListOfLikeUsers = comment.listOfLikeUsers.concat(currentUser)

        const updatedComment = await Comment.findOneAndUpdate(
          { _id: args.id },
          {
            listOfLikeUsers: updatedListOfLikeUsers,
            $inc: { likes: 1 }
          },
          { new: true }
        )

        const updatedCommentLikes = currentUser.commentLikes.concat(updatedComment)

        await User.findOneAndUpdate(
          { _id: currentUser.id },
          { commentLikes: updatedCommentLikes },
          { new: true }
        )

        return updatedComment
      }
    },
    dislikeComment: async (root, args, context) => {
      const currentUser = checkUser(context)
      const comment = await Comment.findOne({ _id: args.id })
        .populate({ path: 'user', model: 'User' })
        .populate({ path: 'listOfLikeUsers', model: 'User' })
        .populate({ path: 'listOfDislikeUsers', model: 'User' })

      if (!comment) {
        throw new UserInputError('Comment needs to exist to be able to dislike', {
          invalidArgs: args
        })
      }

      //check if the user has already disliked the comment
      const usersCommentDislikes = currentUser.commentDislikes.map(comment => comment.id)
      checkUserAction(usersCommentDislikes, args, 'vote')

      // check if the user has liked the comment
      const usersCommentLikes = currentUser.commentLikes.map(comment => comment.id)
      const hasLiked = usersCommentLikes.includes(args.id)

      if (hasLiked) {
        //if the user has previously liked the comment, remove comment from users list of liked comments and add it to list of disliked comments
        //also remove user from comments list of users who have liked it and add user to list of users who have disliked it
        //increment/decrement comment's creator's total likes/dislikes
        await User.findOneAndUpdate(
          { _id: comment.user._id },
          { $inc: { totalLikes: -1, totalDislikes: 1 } },
          { new: true }
        )

        const updatedListOfLikeUsers = comment.listOfLikeUsers.filter(user => user.id !== currentUser.id)
        const updatedListOfDislikeUsers = comment.listOfDislikeUsers.concat(currentUser)

        const updatedComment = await Comment.findOneAndUpdate(
          { _id: args.id },
          {
            listOfLikeUsers: updatedListOfLikeUsers,
            listOfDislikeUsers: updatedListOfDislikeUsers,
            $inc: { likes: -1, dislikes: 1 }
          },
          { new: true }
        )

        const updatedCommentLikes = currentUser.commentLikes.filter(comment => comment.id !== args.id)
        const updatedCommentDislikes = currentUser.commentDislikes.concat(updatedComment)

        await User.findOneAndUpdate(
          { _id: currentUser.id },
          {
            commentLikes: updatedCommentLikes,
            commentDislikes: updatedCommentDislikes
          },
          { new: true }
        )

        return updatedComment
      } else {
        //if user has not previously liked the comment, add comment to users list of disliked comments
        //also add user to comments list of users who have liked it
        //increment comment's creator's total dislikes
        await User.findOneAndUpdate(
          { _id: comment.user._id },
          { $inc: { totalDislikes: 1 } },
          { new: true }
        )

        const updatedListOfDislikeUsers = comment.listOfDislikeUsers.concat(currentUser)

        const updatedComment = await Comment.findOneAndUpdate(
          { _id: args.id },
          {
            listOfDislikeUsers: updatedListOfDislikeUsers,
            $inc: { dislikes: 1 }
          },
          { new: true }
        )

        const updatedCommentDislikes = currentUser.commentDislikes.concat(updatedComment)

        await User.findOneAndUpdate(
          { _id: currentUser.id },
          { commentDislikes: updatedCommentDislikes },
          { new: true }
        )

        return updatedComment
      }
    },
    unlikeComment: async (root, args, context) => {
      const currentUser = checkUser(context)
      const comment = await Comment.findOne({ _id: args.id })
        .populate({ path: 'user', model: 'User' })
        .populate({ path: 'listOfLikeUsers', model: 'User' })

      if (!comment) {
        throw new UserInputError('Comment must exist to be able to unlike', {
          invalidArgs: args
        })
      }

      //check if the user has liked the comment
      const usersCommentLikes = currentUser.commentLikes.map(comment => comment.id)
      checkUserAction(usersCommentLikes, args, 'unvote')

      //decrement comment's creators total likes
      await User.findOneAndUpdate(
        { _id: comment.user._id },
        { $inc: { totalLikes: -1 } },
        { new: true }
      )

      //remove comment from users list of liked comments
      const updatedListOfLikedComments = currentUser.commentLikes.filter(comment => comment.id !== args.id)
      await User.findOneAndUpdate(
        { _id: currentUser.id },
        { commentLikes: updatedListOfLikedComments },
        { new: true }
      )

      //remove user from comments list of users who have liked it
      const updatedListOfLikeUsers = comment.listOfLikeUsers.filter(user => user.id !== currentUser.id)
      const updatedComment = await Comment.findOneAndUpdate(
        { _id: args.id },
        { listOfLikeUsers: updatedListOfLikeUsers, $inc: { likes: -1 } },
        { new: true }
      )

      return updatedComment
    },
    undislikeComment: async (root, args, context) => {
      const currentUser = checkUser(context)
      const comment = await Comment.findOne({ _id: args.id })
        .populate({ path: 'user', model: 'User' })
        .populate({ path: 'listOfDislikeUsers', model: 'User' })

      if (!comment) {
        throw new UserInputError('Comment must exist to be able to undislike', {
          invalidArgs: args
        })
      }

      //check if the user has disliked the comment
      const usersCommentDislikes = currentUser.commentDislikes.map(comment => comment.id)
      checkUserAction(usersCommentDislikes, args, 'unvote')

      //decrement comment's creator's total dislikes
      await User.findOneAndUpdate(
        { _id: comment.user._id },
        { $inc: { totalDislikes: -1 } },
        { new: true }
      )

      //remove comment from users list of disliked comments
      const updatedListOfDislikedComments = currentUser.commentDislikes.filter(comment => comment.id !== args.id)
      await User.findOneAndUpdate(
        { _id: currentUser.id },
        { commentDislikes: updatedListOfDislikedComments },
        { new: true }
      )

      //remove user from comments list of users who have disliked it
      const updatedListOfDislikeUsers = comment.listOfDislikeUsers.filter(user => user.id !== currentUser.id)
      const updatedComment = await Comment.findOneAndUpdate(
        { _id: args.id },
        { listOfDislikeUsers: updatedListOfDislikeUsers, $inc: { dislikes: -1 } },
        { new: true }
      )

      return updatedComment
    }
  }
}

module.exports = comment