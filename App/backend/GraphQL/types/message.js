const { gql } = require('apollo-server')

const message = gql`
  type Message {
    id: ID!
    user: User!
    comment: Comment
    post: Post
    content: String!
  }

  type Query {
    userMessagesAmount(userId: ID!): Int
    userMessages(userId: ID!): [Message!]!
  }

  type Mutation {
    createMessage (
      userId: ID!
      commentId: ID
      postId: ID
      content: String!
    ): Message
    deleteMessage (
      id: ID!
    ): Message
  }
`

module.exports = message