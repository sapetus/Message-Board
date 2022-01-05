const { gql } = require('apollo-server')

const typeDefs = gql`
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

  type Post {
    id: ID!
    title: String!
    text: String!
    likes: Int!
    dislikes: Int!
    discussion: Discussion!
    comments: [Comment!]!
    user: User!
  }

  type Discussion {
    id: ID!
    name: String!
    members: Int!
    listOfMembers: [User!]!
    posts: [Post!]!
  }

  type Comment {
    id: ID!
    text: String!
    likes: Int!
    dislikes: Int!
    post: Post!
    user: User!
  }

  type Query {
    allDiscussions: [Discussion!]!
    findDiscussion(name: String!): Discussion
    findPost(id: ID!): Post
    getCurrentUser: User
    getUserByName(username: String!): User
  }

  type Mutation {
    createUser (
      username: String!
      password: String!
    ): User
    createDiscussion (
      name: String!
    ): Discussion
    createPost (
      title: String!
      text: String!
      discussionName: String!
    ): Post
    createComment (
      text: String!
      postId: ID!
    ): Comment
    likePost (
      id: ID!
    ): Post
    dislikePost (
      id: ID!
    ): Post
    likeComment (
      id: ID!
    ): Comment
    dislikeComment (
      id: ID!
    ): Comment
    login (
      username: String!
      password: String!
    ): Token
    subscribeToDiscussion (
      discussionName: String!
    ): Discussion
    unsubscribeFromDiscussion (
      discussionName: String!
    ): Discussion
  }
`

module.exports = typeDefs