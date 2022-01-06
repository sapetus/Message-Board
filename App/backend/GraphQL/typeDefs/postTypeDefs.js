const { gql } = require('apollo-server')

const postTypeDefs = gql`
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
  }
`

module.exports = postTypeDefs