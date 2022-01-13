const { gql } = require('apollo-server')

const post = gql`
  type Post {
    id: ID!
    title: String!
    text: String!
    likes: Int!
    dislikes: Int!
    discussion: Discussion!
    comments: [Comment!]!
    user: User!
    listOfLikeUsers: [User!]!
    listOfDislikeUsers: [User!]!
  }

  type Query {
    findPost(id: ID!): Post
    findPostsByUser(
      username: String!
      first: Int
      after: Int
    ): [Post]
  }

  type Mutation {
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
    unlikePost (
      id: ID!
    ): Post
    undislikePost (
      id: ID!
    ): Post
  }
`

module.exports = post