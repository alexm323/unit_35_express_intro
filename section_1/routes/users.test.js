// Tell Node that we're in test "mode"
// Need to make sure that process.env line is before the require db because it will then determine whether it will use a test or normal db
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db')

let testUser;
// What we want to do before we test is create a variable where we will be storing the data that we get back and that will just make the testing easier. 
beforeEach(async () => {
  const result = await db.query(`INSERT INTO users (name,type) VALUES ('Peanut','admin')
  RETURNING id, name, type`);
  testUser = result.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM users`)
})
afterAll(async () => {
  await db.end()
})

// describe("Hope this works", () => {
//   test("Blah", () => {
//     console.log(testUser);
//     expect(1).toBe(1);
//   })
// })
describe("GET /users", () => {
  test('Get a list with one user', async () => {
    const res = await request(app).get('/users')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ users: [testUser] })
  })
})

describe("GET /users/:id", () => {
  test('Get a single user', async () => {
    const res = await request(app).get(`/users/${testUser.id}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ user: testUser })
  })
  test('Responds with 404 for invalid id', async () => {
    const res = await request(app).get(`/users/0`)
    expect(res.statusCode).toBe(404);
  })
})
describe("post /users", () => {
  test('Create a single user ', async () => {
    const res = await request(app).post('/users').send({ name: 'Billybob', type: 'staff' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      user: { id: expect.any(Number), name: 'Billybob', type: 'staff' }
    })
  })
})

describe("PATCH /users/:id", () => {
  test('Updates a single user ', async () => {
    const res = await request(app).patch(`/users/${testUser.id}`).send({ name: 'Billybob', type: 'admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      user: { id: testUser.id, name: 'Billybob', type: 'admin' }
    })
  })
  test('Tries to update an invalid user', async () => {
    const res = await request(app).patch(`/users/0`).send({ name: 'Billybob', type: 'admin' });
    expect(res.statusCode).toBe(404);

  })

})

describe("DELETE /users/:id", () => {
  test('Deletes a single user ', async () => {
    const res = await request(app).delete(`/users/${testUser.id}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: 'DELETED!' })
  })
})