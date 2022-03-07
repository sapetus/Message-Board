export const clearDatabase = function () {
  cy.request({
    method: 'POST',
    url: 'http://localhost:4000/graphql',
    body: {
      operationName: 'clearDatabase',
      query: `
        mutation clearDatabase {
          clearDatabase {
            comments
            discussions
            messages
            posts
            users
          }
        }
      `
    }
  })
}

export const logIn = function () {
  cy.visit('http://localhost:3000') 
  cy.contains('Log In').click()
  cy.get('#username').type('TestUser')
  cy.get('#password').type('TestPassword')
  cy.get('#submitUser').click()
  cy.contains('Wrong Credentials').should('not.exist')
}

export const logOut = function () {
  cy.visit('http://localhost:3000')
  cy.contains('Log Out').click()
}

export const register = function () {
  cy.visit('http://localhost:3000')
  cy.contains('Register').click()
  cy.get('#username').type('TestUser')
  cy.get('#password').type('TestPassword')
  cy.get('#confirmPassword').type('TestPassword')
  cy.get('#submitUser').click()
  cy.contains('Registration successful')
}

export const createDiscussion = function () {
  cy.contains('Create Discussion').click()
  cy.get('#discussionName').type('Example Discussion')
  cy.get('#discussionDescription').type('Discussion Description')
  cy.contains('Create').click()
  cy.contains('Example Discussion')
  cy.contains('Discussion Description')
}