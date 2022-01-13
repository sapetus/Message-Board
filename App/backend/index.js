require('dotenv').config()

const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const http = require('http')
const express = require('express')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const typeDefs = require('./GraphQL/types/mergedTypes')
const resolvers = require('./GraphQL/resolvers/mergedResolvers')
const User = require('./models/User')

const JWT_SECRET = process.env.JWT_SECRET
let URI = ''
const node_env = process.env.NODE_ENV
switch (node_env) {
  case 'test':
    URI = process.env.TEST_MONGODB_URI
    break
  case 'development':
    URI = process.env.DEV_MONGODB_URI
    break
  case 'production':
    URI = process.env.MONGODB_URI
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

const startApolloServer = async () => {
  const app = express()
  const httpServer = http.createServer(app)

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

  await server.start()
  server.applyMiddleware({ app })

  await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve))
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
}

startApolloServer()