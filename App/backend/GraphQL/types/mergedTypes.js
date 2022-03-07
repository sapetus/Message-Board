const { mergeTypeDefs } = require('@graphql-tools/merge')

const user = require('./user')
const discussion = require('./discussion')
const post = require('./post')
const comment = require('./comment')
const message = require('./message')
const misc = require('./misc')

const mergedTypes = [user, discussion, post, comment, message, misc]

module.exports = mergeTypeDefs(mergedTypes)