const { ApolloServer, gql } = require('apollo-server')

let comments = [
  {
    id: "1515sfsfg2354t",
    text: "Are you watering your plants?"
  },
  {
    id: "90g0a9e45",
    text: "Ofcourse I water my plants you dumdum!"
  }
]

let posts = [
  {
    id: "9ifd9fasj90gj09",
    title: "Nothing grows",
    text: "I recently started gardening, but it seems that everything I plant dies shortly after. What to do?",
    likes: 15,
    dislikes: 3
  }
]

let discussions = [
  {
    id: "2845g9dfgdfgg",
    name: "Gardening",
    members: 642
  }
]

const typeDefs = gql`
  type Comment {
    id: ID!
    text: String!
    comments: [Comment]
  }

  type Post {
    id: ID!
    title: String!
    text: String!
    likes: Int!
    dislikes: Int!
    comments: [Comment!]
  }

  type Discussion {
    id: ID!
    name: String!
    members: Int!
    posts: [Post!]
  }

  type Query {
    discussionCount: Int!
    postCount: Int!
    commentCount: Int!
    allDiscussions: [Discussion!]!
  }
`

const resolvers = {
  Query: {
    discussionCount: () => discussions.length,
    postCount: () => posts.length,
    commentCount: () => comments.length,
    allDiscussions: () => discussions
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})