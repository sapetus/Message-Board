const { AuthenticationError } = require('apollo-server')

const checkUser = (context) => {
  const currentUser = context.currentUser

  if (!currentUser) {
    throw new AuthenticationError("No Authentication")
  }

  return currentUser
}

module.exports = { checkUser }