const { gql } = require('apollo-server')

const misc = gql`
  type deletedItems {
    comments: Int!
    discussions: Int!
    messages: Int!
    posts: Int!
    users: Int!
  }

  type Mutation {
    clearDatabase: deletedItems
  }
`

module.exports = misc