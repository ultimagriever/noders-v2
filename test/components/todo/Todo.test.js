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
const Todo = require('../../../src/models/Todo');
const TodoFactory = require('../../factory/Todo');
const clearDb = require('../../utils/clearDb');

describe('Todo Routes', () => {
  let user, todo;
  let token = '';
  const headers = {};

  beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    user = new User(UserFactory.getCreateData());
    await user.save();

    token = UserFactory.getAuthToken(user);
    headers.Authorization = `Bearer ${token}`;

    todo = new Todo({ ...TodoFactory.getCreateData(), owner: user._id });
    await todo.save();

    return true;
  });

  afterEach(async () => {
    await clearDb();

    return mongoose.connection.close();
  });

  test('Gets a list of a user\'s todos', async () => {
    const expectedResult = (await Todo.find({ owner: user._id }))
      .map(todo => ({
        _id: String(todo._id),
        title: todo.title,
        status: todo.status,
        owner: String(user._id),
        __v: 0,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString()
      }));

    const response = await request(app)
      .get('/todos')
      .set(headers)
      .expect(200);

    expect(response.body).toEqual(expectedResult);

    const anotherUser = new User(UserFactory.getCreateData());
    await anotherUser.save();

    const anotherTodo = new Todo({ ...TodoFactory.getCreateData(), owner: anotherUser._id });
    await anotherTodo.save();

    const expectedAnotherResult = (await Todo.find({ owner: anotherUser._id }))
      .map(todo => ({
        _id: String(todo._id),
        title: todo.title,
        status: todo.status,
        owner: String(anotherUser._id),
        __v: 0,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString()
      }));

    const anotherResponse = await request(app)
      .get('/todos')
      .set({ Authorization: `Bearer ${UserFactory.getAuthToken(anotherUser)}`})
      .expect(200);

    expect(anotherResponse.body).toEqual(expectedAnotherResult);
  });

  test('Gets a single todo that belongs to a user', async () => {
    const response = await request(app)
      .get(`/todos/${todo._id}`)
      .set(headers)
      .expect(200);

    expect(response.body).toEqual({
      __v: 0,
      _id: String(todo._id),
      title: todo.title,
      status: todo.status,
      owner: String(user._id),
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    });
  });

  test('Returns 404 if todo does not belong to the user', async () => {
    const anotherUser = new User(UserFactory.getCreateData());
    await anotherUser.save();
    const anotherTodo = new Todo({ ...TodoFactory.getCreateData(), owner: anotherUser._id });
    await anotherTodo.save();

    const response = await request(app)
      .get(`/todos/${anotherTodo._id}`)
      .set(headers)
      .expect(404);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Todo not found');
  });

  test('Creates a todo', async () => {
    const payload = TodoFactory.getCreateData();

    const response = await request(app)
      .post('/todos')
      .send(payload)
      .set(headers)
      .expect(201);

    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('owner');
    expect(response.body.title).toBe(payload.title);
    expect(response.body.status).toBe('todo');
    expect(response.body.owner).toBe(String(user._id));
  });

  test('Updates a todo with a valid value', async () => {
    const payload = TodoFactory.getCreateData();

    const response = await request(app)
      .put(`/todos/${todo._id}`)
      .send(payload)
      .set(headers)
      .expect(200);

    expect(response.body.ok).toBe(1);
  });

  test('Fails update if status value is invalid', async () => {
    const payload = { ...TodoFactory.getCreateData(), status: faker.lorem.word() };

    await request(app)
      .put(`/todos/${todo._id}`)
      .send(payload)
      .set(headers)
      .expect(500);
  });

  test('Deletes a todo', async () => {
    const response = await request(app)
      .delete(`/todos/${todo._id}`)
      .set(headers)
      .expect(200);

    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('id');
    expect(response.body.success).toBeTruthy();
    expect(response.body.id).toBe(String(todo._id));
  });

  test('Returns 404 if the todo doesn\'t exist', async () => {
    const response = await request(app)
      .delete(`/todos/${mongoose.Types.ObjectId()}`)
      .set(headers)
      .expect(404);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Todo not found');
  });

  test('Returns 403 if the todo doesn\'t belong to the user', async  () => {
    const anotherUser = new User(UserFactory.getCreateData());
    await anotherUser.save();

    const response = await request(app)
      .delete(`/todos/${todo._id}`)
      .set({ Authorization: `Bearer ${UserFactory.getAuthToken(anotherUser)}` })
      .expect(403);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Forbidden');
  });
});
