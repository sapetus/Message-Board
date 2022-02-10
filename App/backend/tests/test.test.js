const EasyGraphQLTester = require('easygraphql-tester')

const typeDefs = require('../GraphQL/types/mergedTypes')
const resolvers = require('../GraphQL/resolvers/mergedResolvers')

describe("Test queries and mutations", () => {
  let tester

  beforeAll(() => {
    tester = new EasyGraphQLTester(typeDefs, resolvers)
  })

  describe("Queries", () => {
    test("Invalid query returns false", () => {
      const invalidQuery = `
        {
          invalidQuery {
            id
            invalidField
          }
        }
      `

      tester.test(false, invalidQuery)
    })
    test("Valid query returns true", () => {
      const validQuery = `
        {
          allDiscussions {
            id
            name
            members
          }
        }
      `

      tester.test(true, validQuery)
    })
  })

  describe("Mutations", () => {
    test("Invalid mutation returns false", () => {
      const invalidMutation = `
        mutation InvalidMutation($invalid: String!) {
          invalidMutation(invalid: $invalid) {
            id
            invalidField
          }
        }
      `

      tester.test(false, invalidMutation, {
        invalid: "Invalid"
      })
    })
    test("Valid mutation returns true", () => {
      const validMutation = `
        mutation CreateDiscussion($name: String!, $description: String!) {
          createDiscussion(name: $name, description: $description) {
            id
            name
            description
            members
          }
        }
      `

      tester.test(true, validMutation, {
        name: "Discussion",
        description: "Description of the discussion"
      })
    })
  })
})