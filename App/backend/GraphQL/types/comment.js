const { gql } = require('apollo-server')

const comment = gql`
  enum Order {
    NEW
    OLD
    LIKES
    DISLIKES
  }

  type Comment {
    id: ID!
    text: String!
    likes: Int!
    dislikes: Int!
    post: Post!
    responseTo: Comment
    user: User!
    listOfLikeUsers: [User!]!
    listOfDislikeUsers: [User!]!
  }

  type Query {
    findComment(id: ID!): Comment
    findCommentsByPost(
      id: ID!
      first: Int
      after: Int
      order: Order
    ): [Comment]
    findCommentsByUser(
      username: String!
      first: Int
      after: Int
      order: Order
    ): [Comment]
  }

  type Mutation {
    createComment (
      text: String!
      postId: ID!
      responseToId: ID
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

module.exports = comment