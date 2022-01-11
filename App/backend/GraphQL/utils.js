const { AuthenticationError, UserInputError } = require('apollo-server')

//is used to check if user is logged in
const checkUser = (context) => {
  const currentUser = context.currentUser

  if (!currentUser) {
    throw new AuthenticationError("No Authentication")
  }

  return currentUser
}

//is used to check if user has already made a specific action
const checkUserAction = (listToCheck, args, action) => {
  switch (action) {
    case 'vote':
      if (listToCheck.includes(args.id)) {
        throw new UserInputError('User has already voted this, cannot vote', {
          invalidArgs: args
        })
      }
      break
    case 'unvote':
      if (!listToCheck.includes(args.id)) {
        throw new UserInputError('User has not voted this previously, cannot unvote', {
          invalidArgs: args
        })
      }
      break
    case 'subscribe':
      if (listToCheck.includes(args.discussionName)) {
        throw new UserInputError('User has already subscribed to this discussion', {
          invalidArgs: args
        })
      }
      break
    case 'unsubscribe':
      if (!listToCheck.includes(args.discussionName)) {
        throw new UserInputError('User is not subscribed to this discussion, cannot unsubscribe', {
          invalidArgs: args
        })
      }
      break
    default:
      throw new Error('Unexpected action type')
  }
}

module.exports = {
  checkUser,
  checkUserAction
}