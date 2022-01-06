const { gql } = require('apollo-server')

const commentTypeDefs = gql`
  type Comment {
    id: ID!
    text: String!
    likes: Int!
    dislikes: Int!
    post: Post!
    user: User!
  }

  type Mutation {
    createComment (
      text: String!
      postId: ID!
    ): Comment
    likeComment (
      id: ID!
    ): Comment
    dislikeComment (
      id: ID!
    ): Comment
  }
`

module.exports = commentTypeDefs