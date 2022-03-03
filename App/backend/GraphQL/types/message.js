const { gql } = require('apollo-server')

const message = gql`
  type Message {
    id: ID!
    user: User!
    responder: User!
    comment: Comment
    post: Post
    seen: Boolean!
    responseTo: String!
  }

  type Query {
    userNewMessagesAmount(username: String!): Int
    userMessagesAmount(username: String!): Int
    userMessages(username: String!, first: Int, after: Int): [Message!]!
  }

  type Mutation {
    createMessage (
      userId: ID!
      responderId: ID!
      commentId: ID
      postId: ID
      responseTo: String
    ): Message
    deleteMessage (
      id: ID!
    ): Message
    deleteAllMessagesForUser(
      username: String!
    ): Int
    messageAcknowledged (
      id: ID!
    ): Message
  }
`

module.exports = message