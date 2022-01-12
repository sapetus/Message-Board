const { mergeTypeDefs } = require('@graphql-tools/merge')

const user = require('./user')
const discussion = require('./discussion')
const post = require('./post')
const comment = require('./comment')

const mergedTypes = [user, discussion, post, comment]

module.exports = mergeTypeDefs(mergedTypes)