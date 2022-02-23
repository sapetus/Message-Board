const { gql } = require('apollo-server')

const message = gql`
  type Message {
    id: ID!
    user: User!
    comment: Comment
    post: Post
    seen: Boolean!
  }

  type Query {
    userMessagesAmount(username: String!): Int
    userMessages(username: String!): [Message!]!
  }

  type Mutation {
    createMessage (
      userId: ID!
      commentId: ID
      postId: ID
    ): Message
    deleteMessage (
      id: ID!
    ): Message
    messageAcknowledged (
      id: ID!
    ): Message
  }
`

module.exports = message