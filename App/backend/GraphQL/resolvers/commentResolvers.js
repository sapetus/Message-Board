const { UserInputError } = require('apollo-server')

const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const User = require('../../models/User')

const { checkUser } = require('../utils')

const commentResolvers = {
  Query: {
    findComment: async (root, args) => {
      const comment = await Comment.findOne({ _id: args.id })
        .populate('post')
        .populate('user')
        .populate({ path: 'listOfLikeUsers', model: 'User' })
        .populate({ path: 'listOfDislikeUsers', model: 'User' })

      return comment
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
        .populate({ path: 'listOfLikeUsers', model: 'User' })
        .populate({ path: 'listOfDislikeUsers', model: 'User' })

      if (!comment) {
        throw new UserInputError('Comment has to exist to be able to like it', {
          invalidArgs: args
        })
      }

      //check if the user has already liked the comment
      const usersCommentLikes = currentUser.commentLikes.map(comment => comment.id)
      const hasLiked = usersCommentLikes.includes(args.id)

      if (hasLiked) {
        throw new UserInputError('User has already liked this comment', {
          invalidArgs: args
        })
      }

      //check if the use has disliked the comment
      const usersCommentDislikes = currentUser.commentDislikes.map(comment => comment.id)
      const hasDisliked = usersCommentDislikes.includes(args.id)

      if (hasDisliked) {
        //if user has already disliked the comment, remove comment from users list of disliked comments and add it to list of liked comments
        //also remove user from comments list of users who have disliked it and add user to list of users who have liked it 
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

      if (!comment) {
        throw new UserInputError('Comment needs to exist to be able to dislike', {
          invalidArgs: args
        })
      }

      //check if the user has already disliked the comment
      const usersCommentDislikes = currentUser.commentDislikes.map(comment => comment.id)
      const hasDisliked = usersCommentDislikes.includes(args.id)

      if (hasDisliked) {
        throw new UserInputError('User has already disliked this comment', {
          invalidArgs: args
        })
      }

      // check if the user has liked the comment
      const usersCommentLikes = currentUser.commentLikes.map(comment => comment.id)
      const hasLiked = usersCommentLikes.includes(args.id)

      if (hasLiked) {
        //if the user has previously liked the comment, remove comment from users list of liked comments and add it to list of disliked comments
        //also remove user from comments list of users who have liked it and add user to list of users who have disliked it
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
    }
  }
}

module.exports = commentResolvers