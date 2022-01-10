const { gql } = require('apollo-server')

const commentTypeDefs = gql`
  type Comment {
    id: ID!
    text: String!
    likes: Int!
    dislikes: Int!
    post: Post!
    user: User!
    listOfLikeUsers: [User!]!
    listOfDislikeUsers: [User!]!
  }

  type Query {
    findComment(id: ID!): Comment
  }

  type Mutation {
    createComment (
      text: String!
      postId: ID!
    ): Comment
    likeComment (
      id: ID!
    ): Comment
    dislikeComment (
      id: ID!
    ): Comment
    unlikeComment (
      id: ID!
    ): Comment
    undislikeComment (
      id: ID!
    ): Comment
  }
`

module.exports = commentTypeDefs