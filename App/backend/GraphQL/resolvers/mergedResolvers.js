const { mergeResolvers } = require('@graphql-tools/merge')

const discussion = require('./discussion')
const post = require('./post')
const comment = require('./comment')
const user = require('./user')
const message = require('./message')

const mergerdResolvers = [discussion, post, comment, user, message]

module.exports = mergeResolvers(mergerdResolvers)