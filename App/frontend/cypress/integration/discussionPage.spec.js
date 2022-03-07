import { clearDatabase, register, logIn, logOut, createDiscussion } from '../utils'

before(function () {
  clearDatabase()
  cy.visit('http://localhost:3000')
  register()
  logIn()
  createDiscussion()
  logOut()
})

describe('Discussion Page', function () {
  beforeEach(function () {
    cy.visit('http://localhost:3000')
    logIn()
    cy.contains('Example Discussion').click()
  })

  it('can be visited', function () {
    cy.contains('Subscribe')
    cy.contains('Create Post')
  })

  it('post can be created', function () {
    cy.contains('Create Post').click()
    cy.get('#postTitle').type('Example Post Title')
    cy.get('#postText').type('Example Post Text')
    cy.contains('Create').click()
    cy.contains('Example Discussion')
    cy.contains('Post by TestUser')
  })
})