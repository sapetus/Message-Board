const { gql } = require('apollo-server')

const user = gql`
  type Token {
    value: String!
  }

  type User {
    id: ID!
    username: String!
    passwordHash: String!
    totalLikes: Int!
    totalDislikes: Int!
    posts: [Post!]!
    comments: [Comment!]!
    memberOf: [Discussion!]!
    postLikes: [Post!]!
    postDislikes: [Post!]!
    commentLikes: [Comment!]!
    commentDislikes: [Comment!]!
    creationDate: String
  }

  type Query {
    getCurrentUser: User
    getUserByName(username: String!): User
  }

  type Mutation {
    createUser (
      username: String!
      password: String!
    ): User
    login (
      username: String!
      password: String!
    ): Token
  }
`

module.exports = user