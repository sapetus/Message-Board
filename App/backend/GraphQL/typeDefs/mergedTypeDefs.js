const { mergeTypeDefs } = require('@graphql-tools/merge')

const userTypeDefs = require('./userTypeDefs')
const discussionTypeDefs = require('./discussionTypeDefs')
const postTypeDefs = require('./postTypeDefs')
const commentTypeDefs = require('./commentTypeDefs')

const mergedTypeDefs = [userTypeDefs, discussionTypeDefs, postTypeDefs, commentTypeDefs]

module.exports = mergeTypeDefs(mergedTypeDefs)