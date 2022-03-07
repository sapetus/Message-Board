import { clearDatabase, register, logIn } from '../utils'

before(function () {
  clearDatabase()
  cy.visit('http://localhost:3000')
  register()
})

describe('User Page', function () {
  beforeEach(function () {
    cy.visit('http://localhost:3000')
    logIn()
  })

  it('can be visited', function () {
    cy.contains('Profile').click()
    cy.contains('Posts')
    cy.contains('Comments')
    cy.contains('Subscriptions')
    cy.contains('TestUser')
  })
})