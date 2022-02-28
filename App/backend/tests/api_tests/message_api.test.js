const supertest = require('supertest')
const mongoose = require('mongoose')

//const { app } = require('../../app')
const helper = require('../testHelper')
const Message = require('../../models/Message')

//const api = supertest(app)

describe('Message', () => {
  test("dummy test", () => {
    expect(true).toEqual(true)
  })
})

afterAll(() => {
  mongoose.connection.close()
})