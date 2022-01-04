require('dotenv').config()

const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const typeDefs = require('./GraphQL/typeDefs')
const resolvers = require('./GraphQL/resolvers')
const User = require('./models/User')

const JWT_SECRET = process.env.JWT_SECRET
const URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

console.log('connecting to MongoDB...')
mongoose.connect(URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB: ', error.message)
  })

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User
        .findById(decodedToken.id)
        .populate({ path: 'posts', model: 'Post' })
        .populate({ path: 'comments', model: 'Comment' })
        .populate({ path: 'memberOf', model: 'Discussion'})
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})