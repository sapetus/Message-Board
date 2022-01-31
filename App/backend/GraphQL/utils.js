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

const paginate = (list, first, after) => {
  let listCopy = list

  if (first && after) {
    listCopy = list.slice(after, after + first)
  } else if (first) {
    listCopy = list.slice(0, first)
  } else if (after) {
    listCopy = list.slice(after)
  }

  return listCopy
}

const sort = (list, keyword) => {
  let listCopy = list

  if (keyword) {
    switch (keyword) {
      case "NEW":
        listCopy = list.reverse()
        break
      case "OLD":
        //defaults to OLD
        break
      case "LIKES":
        listCopy = list.sort((a, b) => (a.likes > b.likes) ? -1 : 1)
        break
      case "DISLIKES":
        listCopy = list.sort((a, b) => (a.dislikes > b.dislikes) ? -1 : 1)
        break
      case "MEMBERS":
        listCopy = list.sort((a, b) => (a.members < b.members) ? 1 : -1)
        break;
      case "ALPHABETICAL":
        listCopy = list.sort((a, b) => (a.name < b.name) ? -1 : 1)
        break;
      default:
        throw new UserInputError('not a valid order', {
          invalidArgs: args.order
        })
    }
  }

  return listCopy
}

const filter = (list, filter) => {
  let listCopy = list

  if (filter) {

    listCopy = list.filter(
      item => item.name.toLowerCase()
        .includes(filter.toLowerCase())
    )
  }

  return listCopy
}

module.exports = {
  checkUser,
  checkUserAction,
  paginate,
  sort,
  filter
}