import { clearDatabase } from '../utils'

before(function () {
  clearDatabase()
})

it('Registration works', function () {
  cy.visit('http://localhost:3000')
  cy.contains('Register').click()
  cy.get('#username').type('TestUser')
  cy.get('#password').type('TestPassword')
  cy.get('#confirmPassword').type('TestPassword')
  cy.get('#submitUser').click()
  cy.contains('Registration successful')
})

it('Log in works', function () {
  cy.visit('http://localhost:3000') 
  cy.contains('Log In').click()
  cy.get('#username').type('TestUser')
  cy.get('#password').type('TestPassword')
  cy.get('#submitUser').click()
  cy.contains('Wrong Credentials').should('not.exist')
})