import { clearDatabase, register, logIn } from '../utils'

before(function () {
  clearDatabase()
  cy.visit('http://localhost:3000')
  register()
})

describe('Landing page', function () {
  beforeEach(function () {
    cy.visit('http://localhost:3000')
    logIn()
  })

  it('can be visited', function() {
    cy.contains('Discussions')
  })

  it('discussion can be created', function () {
    cy.contains('Create Discussion').click()
    cy.get('#discussionName').type('Example Discussion')
    cy.get('#discussionDescription').type('Discussion Description')
    cy.contains('Create').click()
    cy.contains('Example Discussion')
    cy.contains('Discussion Description')
  })
})