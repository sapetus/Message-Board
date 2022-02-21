require('dotenv').config()
require('express-async-errors')

const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const express = require('express')
const path = require('path')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const typeDefs = require('./GraphQL/types/mergedTypes')
const resolvers = require('./GraphQL/resolvers/mergedResolvers')
const User = require('./models/User')

const JWT_SECRET = process.env.JWT_SECRET
let URI = process.env.MONGODB_URI
const node_env = process.env.NODE_ENV
switch (node_env) {
  case 'test':
    URI = process.env.TEST_MONGODB_URI
    break
  case 'development':
    URI = process.env.DEV_MONGODB_URI
    break
  default:
    break
}

console.log('connecting to MongoDB...')
mongoose.connect(URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB: ', error.message)
  })

const app = express()

//if in production mode, serve static files from frontend
if (URI === process.env.MONGODB_URI) {
  app.use(express.static(path.join(__dirname, '/build')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'))
  })
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLocaleLowerCase().startsWith('bearer')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
        .populate({
          path: 'memberOf',
          model: 'Discussion'
        })
        .populate({
          path: 'postLikes',
          model: 'Post'
        })
        .populate({
          path: 'postDislikes',
          model: 'Post'
        })
        .populate({
          path: 'commentLikes',
          model: 'Comment'
        })
        .populate({
          path: 'commentDislikes',
          model: 'Comment'
        })

      return { currentUser }
    }
  }
})

const startServer = async () => {
  await server.start()
  server.applyMiddleware({ app, path: '/graphql', bodyParserConfig: { limit: '2mb' } })
}

startServer()

module.exports = { app }