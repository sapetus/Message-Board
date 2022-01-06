const { mergeResolvers } = require('@graphql-tools/merge')

const discussionResolvers = require('./discussionResolvers')
const postResolvers = require('./postResolvers')
const commentResolvers = require('./commentResolvers')
const userResolvers = require('./userResolvers')

const mergerdResolvers = [discussionResolvers, postResolvers, commentResolvers, userResolvers]

module.exports = mergeResolvers(mergerdResolvers)