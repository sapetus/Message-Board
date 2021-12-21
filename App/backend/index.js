require('dotenv').config()

const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')

const Discussion = require('./models/Discussion')
const Post = require('./models/Post')

const URI = process.env.MONGODB_URI

console.log('connecting to MongoDB...')
mongoose.connect(URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB: ', error.message)
  })

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    text: String!
    likes: Int!
    dislikes: Int!
    discussion: Discussion!
  }

  type Discussion {
    id: ID!
    name: String!
    members: Int!
    posts: [Post!]!
  }

  type Query {
    allDiscussions: [Discussion!]!
    findDiscussion(name: String!): Discussion
    allPosts: [Post!]!
    findPost(id: ID!): Post
  }

  type Mutation {
    createDiscussion (
      name: String!
    ): Discussion
    createPost (
      title: String!
      text: String!
      discussionName: String!
    ): Post
    likePost (
      id: ID!
    ): Post
    dislikePost (
      id: ID!
    ): Post
  }
`

const resolvers = {
  Query: {
    allDiscussions: async () => {
      const discussions = await Discussion.find({})
      const posts = await Post.find({}).populate('discussion')

      discussions.map(discussion =>
        discussion.posts = posts.filter(post =>
          post.discussion.name === discussion.name
        )
      )

      return discussions
    },
    findDiscussion: async (root, args) => {
      const discussion = await Discussion.findOne({ name: args.name })
      const posts = await Post.find({}).populate('discussion')

      discussion.posts = posts.filter(post =>
        post.discussion.name === args.name
      )

      return discussion
    },
    allPosts: async () => {
      const posts = await Post.find({}).populate('discussion')
      return posts
    },
    findPost: async (root, args) => {
      const post = await Post.findOne({ id: args.id }).populate('discussion')
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

      return newPost
    },
    likePost: async (root, args) => {
      const updatedPost = await Post.findOneAndUpdate({ _id: args.id }, { $inc: { likes: 1 } }, { new: true })
      return updatedPost
    },
    dislikePost: async (root, args) => {
      const updatedPost = await Post.findOneAndUpdate({ _id: args.id }, { $inc: { dislikes: 1 } }, { new: true })
      return updatedPost
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})