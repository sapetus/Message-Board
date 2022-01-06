const { gql } = require('apollo-server')

const userTypeDefs = gql`
  type Token {
    value: String!
  }

  type User {
    id: ID!
    username: String!
    passwordHash: String!
    posts: [Post!]!
    comments: [Comment!]!
    memberOf: [Discussion!]!
    postLikes: [Post!]!
    postDislikes: [Post!]!
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

module.exports = userTypeDefs