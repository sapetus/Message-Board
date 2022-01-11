const { UserInputError } = require('apollo-server')

const Discussion = require('../../models/Discussion')
const User = require('../../models/User')

const {
  checkUser,
  checkUserAction
} = require('../utils')

const discussionResolvers = {
  Query: {
    //no need to populate posts, as they are not needed in this query
    allDiscussions: async () => {
      const discussions = await Discussion.find({})

      return discussions
    },
    findDiscussion: async (root, args) => {
      const discussion = await Discussion.findOne({ name: args.name })
        .populate({ path: 'posts', model: 'Post' })
        .populate({ path: 'listOfMembers', model: 'User' })

      return discussion
    }
  },
  Mutation: {
    createDiscussion: async (root, args, context) => {
      checkUser(context)

      if (await Discussion.findOne({ name: args.name })) {
        throw new UserInputError('Name of the discussion must be unique', {
          invalidArgs: args.name
        })
      }

      const newDiscussion = new Discussion({ ...args, members: 0, posts: [] })

      try {
        await newDiscussion.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      return newDiscussion
    },
    subscribeToDiscussion: async (root, args, context) => {
      const currentUser = checkUser(context)
      const discussion = await Discussion.findOne({ name: args.discussionName })

      if (!discussion) {
        throw new UserInputError('Discussion must exist to be able to subscribe', {
          invalidArgs: args
        })
      }

      //Check if the user is already subscribed to this discussion
      const subscriptionNames = currentUser.memberOf.map(discussion => discussion.name)
      checkUserAction(subscriptionNames, args, 'subscribe')

      //add discussion to users list of subscriptions
      const usersSubscriptions = currentUser.memberOf.concat(discussion)
      await User.findOneAndUpdate({ _id: currentUser.id }, { memberOf: usersSubscriptions }, { new: true })

      //update discussion
      const updatedMemberList = discussion.listOfMembers.concat(currentUser)
      const updatedDiscussion = await Discussion.findOneAndUpdate(
        { name: args.discussionName },
        { listOfMembers: updatedMemberList, $inc: { members: 1 } },
        { new: true }
      )

      return updatedDiscussion
    },
    unsubscribeFromDiscussion: async (root, args, context) => {
      const currentUser = checkUser(context)
      const discussion = await Discussion.findOne({ name: args.discussionName })

      if (!discussion) {
        throw new UserInputError('Discussion must exist to be able to unsubscribe', {
          invalidArgs: args
        })
      }

      //Check if the user is subscribed to this discussion
      const subscriptionNames = currentUser.memberOf.map(discussion => discussion.name)
      checkUserAction(subscriptionNames, args, 'unsubscribe')

      //remove discussion from users list of subscriptions
      const usersSubscriptions = currentUser.memberOf.filter(discussion => discussion.name !== args.discussionName)
      await User.findOneAndUpdate({ _id: currentUser.id }, { memberOf: usersSubscriptions }, { new: true })

      //update discussion
      const updatedMemberList = discussion.listOfMembers.filter(user => user.name !== currentUser.name)
      const updatedDiscussion = await Discussion.findOneAndUpdate(
        { name: args.discussionName },
        { listOfMembers: updatedMemberList, $inc: { members: -1 } },
        { new: true }
      )

      return updatedDiscussion
    }
  }
}

module.exports = discussionResolvers