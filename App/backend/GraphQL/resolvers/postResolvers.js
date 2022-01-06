const { UserInputError } = require('apollo-server')

const Post = require('../../models/Post')
const Discussion = require('../../models/Discussion')
const User = require('../../models/User')

const { checkUser } = require('../utils')

const postResolvers = {
  Query: {
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
    }
  },
  Mutation: {
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
    unlikePost: async (root, args, context) => {
      const currentUser = checkUser(context)
      const post = await Post.findOne({ _id: args.id })
        .populate({ path: 'listOfLikeUsers', model: 'User' })

      if (!post) {
        throw new UserInputError('Post must exist to be able to unlike', {
          invalidArgs: args
        })
      }

      //check if user previously has liked the post
      const usersPostLikes = currentUser.postLikes.map(post => post.id)
      const hasLiked = usersPostLikes.includes(args.id)

      if (!hasLiked) {
        throw new UserInputError('Cannot unlike post that has not been liked previously', {
          invalidArgs: args
        })
      }

      //remove post from users list of liked posts and update
      const updatedListOfLikedPosts = currentUser.postLikes.filter(post => post.id !== args.id)
      await User.findOneAndUpdate(
        { _id: currentUser.id },
        { postLikes: updatedListOfLikedPosts },
        { new: true }
      )

      //remove user from posts list of users who have liked it and update
      const updatedListOfLikeUsers = post.listOfLikeUsers.filter(user => user.id !== currentUser.id)
      const updatedPost = await Post.findOneAndUpdate(
        { _id: args.id },
        {
          listOfLikeUsers: updatedListOfLikeUsers,
          $inc: { likes: -1 }
        },
        { new: true }
      )

      return updatedPost
    },
    undislikePost: async (root, args, context) => {
      const currentUser = checkUser(context)
      const post = await Post.findOne({ _id: args.id })
        .populate({ path: 'listOfDislikeUsers', model: 'User' })

      if (!post) {
        throw new UserInputError('Post must exist to be able to undislike', {
          invalidArgs: args
        })
      }

      //check if user has previosly disliked this post
      const usersPostDislikes = currentUser.postDislikes.map(post => post.id)
      const hasDisliked = usersPostDislikes.includes(args.id)

      if (!hasDisliked) {
        throw new UserInputError('Cannot undislike a post users has not disliked', {
          invalidArgs: args
        })
      }

      //remove post from users list of disliked posts and update
      const updatedListOfDislikedPosts = currentUser.postDislikes.filter(post => post.id !== args.id)
      await User.findOneAndUpdate(
        { _id: currentUser.id },
        { postDislikes: updatedListOfDislikedPosts },
        { new: true }
      )

      //remove user from posts list of users who have disliked it and update
      const updatedListOfDislikeUsers = post.listOfDislikeUsers.filter(user => user.id !== currentUser.id)
      const updatedPost = await Post.findOneAndUpdate(
        { _id: args.id },
        {
          listOfDislikeUsers: updatedListOfDislikeUsers,
          $inc: { dislikes: -1 }
        },
        { new: true }
      )

      return updatedPost
    }
  }
}

module.exports = postResolvers