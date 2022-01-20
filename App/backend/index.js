require('dotenv').config()

const http = require('http')
const { app } = require('./app')

const httpServer = http.createServer(app)

const PORT = process.env.PORT || 4000

const startApolloServer = async () => {
  await new Promise(resolve => httpServer.listen({ port: PORT }, resolve))
  console.log(`Server ready at http://localhost:${PORT}/graphql`)
}

startApolloServer()