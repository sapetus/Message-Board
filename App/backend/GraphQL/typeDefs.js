const { gql } = require('apollo-server')

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    text: String!
    likes: Int!
    dislikes: Int!
    discussion: Discussion!
    comments: [Comment!]!
  }

  type Discussion {
    id: ID!
    name: String!
    members: Int!
    posts: [Post!]!
  }

  type Comment {
    id: ID!
    text: String!
    likes: Int!
    dislikes: Int!
    post: Post!
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
    createComment (
      text: String!
      postId: ID!
    ): Comment
    likePost (
      id: ID!
    ): Post
    dislikePost (
      id: ID!
    ): Post
    likeComment (
      id: ID!
    ): Comment
    dislikeComment (
      id: ID!
    ): Comment
  }
`

module.exports = typeDefs