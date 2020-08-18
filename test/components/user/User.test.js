/* global expect */
/* global test */
/* global describe */
/* global beforeEach */
/* global afterEach */

const request = require('supertest');
const mongoose = require('mongoose');
const faker = require('faker');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const UserFactory = require('../../factory/User');
const clearDb = require('../../utils/clearDb');

describe('User Routes', () => {
  beforeEach(async () => mongoose.connect(process.env.MONGODB_URI));

  afterEach(async () => {
    await clearDb();
    return mongoose.connection.close();
  });

  test('Signs a user up', async () => {
    const newUser = UserFactory.getCreateData();

    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('email');
    expect(response.body.email).toBe(newUser.email);
  });

  test('Does not create a user without email or password', async () => {
    await request(app)
      .post('/users')
      .send({ email: faker.internet.email() })
      .expect(500);

    await request(app)
      .post('/users')
      .send({ password: faker.internet.password() })
      .expect(500);
  });

  test('Does not create duplicate users', async () => {
    const user = UserFactory.getCreateData();

    await request(app)
      .post('/users')
      .send(user)
      .expect(201);

    await request(app)
      .post('/users')
      .send(user)
      .expect(500);
  });

  test('Authenticates a user', async () => {
    const payload = UserFactory.getCreateData();

    const user = new User(payload);
    await user.save();

    const response = await request(app)
      .post('/users/authenticate')
      .send(payload)
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });

  describe('Accessing Protected User Routes', () => {
    let user;
    const headers = {};

    beforeEach(async () => {
      user = new User(UserFactory.getCreateData());
      await user.save();

      headers.Authorization = `Bearer ${UserFactory.getAuthToken(user)}`;

      return true;
    });

    afterEach(async () => User.deleteOne({ _id: user._id }));

    test('Fetches a list of users', async () => {
      const expectedResult = (await User.find({}))
        .map(user => ({
          _id: String(user._id),
          email: user.email,
          __v: 0,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }));

      const response = await request(app)
        .get('/users')
        .set(headers)
        .expect(200);

      expect(response.body).toHaveLength(expectedResult.length);
      expect(response.body).toEqual(expectedResult);
    });

    test('Updates a single user', async () => {
      const newEmail = faker.internet.email();

      const response = await request(app)
        .put(`/users/${user._id}`)
        .send({ email: newEmail })
        .set(headers)
        .expect(200);

      expect(response.body.email).toBe(newEmail);
    });

    test('Deletes a user', async () => {
      return request(app)
        .delete(`/users/${user._id}`)
        .set(headers)
        .expect(200);
    });
  });
});
