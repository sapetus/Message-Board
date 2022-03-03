const { UserInputError } = require('apollo-server')

const Post = require('../../models/Post')
const Discussion = require('../../models/Discussion')
const User = require('../../models/User')

const {
  checkUser,
  checkUserAction,
  paginate,
  sort,
  filter
} = require('../utils')

const post = {
  Query: {
    findPost: async (root, args) => {
      const post = await Post.findOne({ _id: args.id })
        .populate('discussion')
        .populate('user', '-passwordHash')
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
    findPostsByUser: async (root, args) => {
      const user = await User.findOne({ username: args.username })
        .populate({
          path: 'posts',
          model: 'Post',
          select: '-image',
          populate: {
            path: 'discussion'
          }
        })

      const posts = user.posts
      const sortedPosts = sort(posts, args.order)

      const paginatedPosts = paginate(
        sortedPosts,
        args.first,
        args.after
      )

      return paginatedPosts
    },
    findPostsByDiscussion: async (root, args) => {
      const discussion = await Discussion.findOne({ name: args.name })
        .populate({
          path: 'posts',
          model: 'Post',
          select: '-image'
        })

      const posts = discussion.posts

      const sortedPosts = sort(posts, args.order)
      const filteredAndSortedPosts = filter(sortedPosts, args.filter)

      const paginatedPosts = paginate(
        filteredAndSortedPosts,
        args.first,
        args.after
      )

      return paginatedPosts
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

      if (!args.title) {
        return new UserInputError('Title is required.', {
          invalidArgs: args.title
        })
      } else if (args.title.length < 5) {
        return new UserInputError('Title has a minimum length of 5.', {
          invalidArgs: args.title
        })
      } else if (!args.text) {
        return new UserInputError('Text is required.', {
          invalidArgs: args.text
        })
      } else if (args.text.length < 5) {
        return new UserInputError('Text has a minimum length of 5.', {
          invalidArgs: args.text
        })
      }

      const newPost = new Post({
        title: args.title,
        text: args.text,
        image: args.image,
        likes: 0,
        dislikes: 0,
        amountOfComments: 0,
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
          path: 'user',
          model: 'User'
        })
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
      checkUserAction(usersPostLikes, args, 'vote')

      //check if the user has disliked the post
      const usersPostDislikes = currentUser.postDislikes.map(post => post.id)
      const hasDisliked = usersPostDislikes.includes(args.id)

      if (hasDisliked) {
        // if user has already disliked the post, remove it from users list of disliked posts and add it to list of liked posts
        // also remove user from posts list of dislike users and add user to list of like users
        // icrement and decrement the posts creators total likes/dislikes
        await User.findOneAndUpdate(
          { _id: post.user._id },
          { $inc: { totalLikes: 1, totalDislikes: -1 } },
          { new: true }
        )

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
        // increment post's creator's totalLikes
        await User.findOneAndUpdate(
          { _id: post.user._id },
          { $inc: { totalLikes: 1 } },
          { new: true }
        )

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
          path: 'user',
          model: 'User'
        })
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
      checkUserAction(usersPostDislikes, args, 'vote')

      //check if the user has liked the post
      const usersPostLikes = currentUser.postLikes.map(post => post.id)
      const hasLiked = usersPostLikes.includes(args.id)

      if (hasLiked) {
        // if user has already liked the post, remove the post from users list of liked post and add it to list of disliked posts
        // also remove user from posts list of like users and add user to list of dislike users
        // increment and decrement post's creator's total likes and dislikes
        await User.findOneAndUpdate(
          { _id: post.user._id },
          { $inc: { totalLikes: -1, totalDislikes: 1 } },
          { new: true }
        )

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
        // increment post's creator's total dislikes
        await User.findOneAndUpdate(
          { _id: post.user._id },
          { $inc: { totalDislikes: 1 } },
          { new: true }
        )

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
        .populate({ path: 'user', model: 'User' })
        .populate({ path: 'listOfLikeUsers', model: 'User' })

      if (!post) {
        throw new UserInputError('Post must exist to be able to unlike', {
          invalidArgs: args
        })
      }

      //check if user previously has liked the post
      const usersPostLikes = currentUser.postLikes.map(post => post.id)
      checkUserAction(usersPostLikes, args, 'unvote')

      // decrement post's creator's total likes
      await User.findOneAndUpdate(
        { _id: post.user._id },
        { $inc: { totalLikes: -1 } },
        { new: true }
      )

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
        .populate({ path: 'user', model: 'User' })
        .populate({ path: 'listOfDislikeUsers', model: 'User' })

      if (!post) {
        throw new UserInputError('Post must exist to be able to undislike', {
          invalidArgs: args
        })
      }

      //check if user has previosly disliked this post
      const usersPostDislikes = currentUser.postDislikes.map(post => post.id)
      checkUserAction(usersPostDislikes, args, 'unvote')

      // decrement post's creator's total dislikes
      await User.findOneAndUpdate(
        { _id: post.user._id },
        { $inc: { totalDislikes: -1 } },
        { new: true }
      )

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

module.exports = post