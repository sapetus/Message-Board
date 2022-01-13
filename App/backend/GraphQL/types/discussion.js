const { gql } = require('apollo-server')

const discussion = gql`
  type Discussion {
    id: ID!
    name: String!
    members: Int!
    listOfMembers: [User!]!
    posts: [Post!]!
  }

  type Query {
    allDiscussions(
      first: Int
      after: Int
    ): [Discussion!]!
    findDiscussion(name: String!): Discussion
    findDiscussionsUserHasSubscribedTo(
      username: String!
      first: Int
      after: Int
    ): [Discussion]
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

module.exports = discussion