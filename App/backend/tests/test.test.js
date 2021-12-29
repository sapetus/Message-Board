const EasyGraphQLTester = require('easygraphql-tester')

const schema = `
  type Test {
    id: ID!
    isTest: Boolean!
  }

  type Query {
    getTestByIsTest(isTest: Boolean!): Test
  }
 `

const query = `
  query TEST($isTest: Boolean!) {
    getTestByIsTest(isTest: $isTest) {
      id
      isTest
    }
  }
 `

function getTestByIsTest(__, args, ctx) {
  return {
    id: 1,
    isTest: args.isTest
  }
}

const resolvers = {
  Query: {
    getTestByIsTest
  }
}

const tester = new EasyGraphQLTester(schema, resolvers)

tester.graphql(query, undefined, undefined, { isTest: false })
  .then(result => console.log(result))
  .catch(error => console.log(error))