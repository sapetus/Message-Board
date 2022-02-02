const { gql } = require('apollo-server')

const discussion = gql`
  enum Order {
    NEW
    OLD
    MEMBERS
    ALPHABETICAL
  }

  type Discussion {
    id: ID!
    name: String!
    description: String!
    members: Int!
    listOfMembers: [User!]!
    posts: [Post!]!
  }

  type Query {
    allDiscussions(
      first: Int
      after: Int
      order: Order
      filter: String
    ): [Discussion!]!
    findDiscussion(name: String!): Discussion
    findDiscussionsUserHasSubscribedTo(
      username: String!
      first: Int
      after: Int
      order: Order
    ): [Discussion]
  }

  type Mutation {
    createDiscussion (
      name: String!
      description: String!
    ): Discussion
    subscribeToDiscussion (
      discussionName: String!
    ): Discussion
    unsubscribeFromDiscussion (
      discussionName: String!
    ): Discussion
  }
`

module.exports = discussion