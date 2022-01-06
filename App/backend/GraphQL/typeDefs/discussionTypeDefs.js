const { gql } = require('apollo-server')

const discussionTypeDefs = gql`
  type Discussion {
    id: ID!
    name: String!
    members: Int!
    listOfMembers: [User!]!
    posts: [Post!]!
  }

  type Query {
    allDiscussions: [Discussion!]!
    findDiscussion(name: String!): Discussion
  }

  type Mutation {
    createDiscussion (
      name: String!
    ): Discussion
    subscribeToDiscussion (
      discussionName: String!
    ): Discussion
    unsubscribeFromDiscussion (
      discussionName: String!
    ): Discussion
  }
`

module.exports = discussionTypeDefs