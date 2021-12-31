const { UserInputError } = require('apollo-server')

const Discussion = require('../models/Discussion')
const Post = require('../models/Post')
const Comment = require('../models/Comment')

const resolvers = {
  Query: {
    //no need to populate posts, as they are not needed in this query
    allDiscussions: async () => {
      const discussions = await Discussion.find({})

      return discussions
    },
    findDiscussion: async (root, args) => {
      const discussion = await Discussion.findOne({ name: args.name }).populate({ path: 'posts', model: 'Post' })

      return discussion
    },
    //no need to populate comments, as they are not needed in this query
    allPosts: async () => {
      const posts = await Post.find({}).populate('discussion')
      return posts
    },
    findPost: async (root, args) => {
      const post = await Post.findOne({ _id: args.id }).populate('discussion').populate({ path: 'comments', model: 'Comment' })
      return post
    }
  },
  Mutation: {
    createDiscussion: async (root, args) => {
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
    createPost: async (root, args) => {
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
        discussion: discussion
      })

      try {
        await newPost.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      //update the specified discussion's list of posts
      let posts = discussion.posts ? discussion.posts : []
      posts.push(newPost.id)
      await Discussion.findOneAndUpdate({ name: args.discussionName }, { posts: posts }, { new: true })

      return newPost
    },
    createComment: async (root, args) => {
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
        post: post
      })

      try {
        await newComment.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      //update the specified post's list of comments
      let comments = post.comments ? post.comments : []
      comments.push(newComment.id)
      await Post.findOneAndUpdate({ _id: args.postId }, { comments: comments }, { new: true })

      return newComment
    },
    likePost: async (root, args) => {
      const updatedPost = await Post.findOneAndUpdate({ _id: args.id }, { $inc: { likes: 1 } }, { new: true })
      return updatedPost
    },
    dislikePost: async (root, args) => {
      const updatedPost = await Post.findOneAndUpdate({ _id: args.id }, { $inc: { dislikes: 1 } }, { new: true })
      return updatedPost
    },
    likeComment: async (root, args) => {
      const updatedComment = await Comment.findOneAndUpdate({ _id: args.id }, { $inc: { likes: 1 } }, { new: true })
      return updatedComment
    },
    dislikeComment: async (root, args) => {
      const updatedComment = await Comment.findOneAndUpdate({ _id: args.id }, { $inc: { dislikes: 1 } }, { new: true })
      return updatedComment
    }
  }
}

module.exports = resolvers