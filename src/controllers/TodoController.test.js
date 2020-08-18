/* global jest */
/* global test */
/* global describe */
/* global expect */
/* global beforeEach */
/* global afterEach */
const faker = require('faker');

jest.mock('../models/Todo');

const Todo = require('../models/Todo');
const TodoController = require('./TodoController');

describe('Todo Controller', () => {
  let req = { user: {} };
  let res = {
    status: jest.fn().mockImplementation(() => res),
    json: jest.fn()
  };
  let next = jest.fn();

  const todos = (new Array(faker.random.number({ min: 1, max: 10 })).fill(0)).map((n, i) => ({
    _id: i + 1,
    title: faker.lorem.words(),
    status: faker.random.arrayElement(['todo', 'doing', 'done']),
    owner: { _id: faker.random.number({ min: 1, max: 2 })}
  }));

  afterEach(() => {
    req = { user: {} };

    jest.clearAllMocks();
  });

  test('List returns all todos belonging to user', async () => {
    const result = todos.filter(todo => todo.owner._id === 1);
    Todo.find.mockResolvedValue(result);

    req.user._id = 1;

    await TodoController.list(req, res, next);

    expect(Todo.find).toHaveBeenCalledWith({ owner: req.user._id });
    expect(res.json).toHaveBeenCalledWith(result);
  });

  test('Sends list error to error middleware', async () => {
    const error = new Error(faker.lorem.words());
    Todo.find.mockRejectedValue(error);

    req.user._id = faker.random.number();
    req.params = { id: faker.random.number() };

    await TodoController.list(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  describe('Fetching a Specific Todo', () => {
    test('Gets a todo that belongs to user', async () => {
      const ownerId = 1;
      const todo = todos.filter(todo => todo.owner._id === ownerId)[0];

      req.user._id = ownerId;
      req.params = { id: todo._id };

      Todo.findById.mockResolvedValue(todo);

      await TodoController.find(req, res, next);

      expect(res.json).toHaveBeenCalledWith(todo);
      expect(Todo.findById).toHaveBeenCalledWith(req.params.id);
    });

    test('Returns 404 - Not Found when trying to get a todo that does not belong to a user', async () => {
      const ownerId = 1;
      const todo = todos.filter(todo => todo.owner._id !== ownerId)[0];

      req.user._id = ownerId;
      req.params = { id: todo._id };

      Todo.findById.mockResolvedValue(todo);

      await TodoController.find(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Todo not found' });
    });

    test('Sends find model error to error middleware', async () => {
      req.user._id = faker.random.number();
      req.params = { id: faker.random.number() };

      const error = new Error(faker.lorem.words());
      Todo.findById.mockRejectedValue(error);

      await TodoController.find(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  test('Creates a todo with the owner as the logged in user', async () => {
    const body = {
      title: faker.lorem.words()
    };

    const ownerId = 1;

    const params = { ...body, owner: ownerId };

    const newTodo = {
      ...body,
      _id: faker.random.number(),
      status: 'todo',
      owner: {
        _id: ownerId
      }
    };

    req.user._id = ownerId;
    req.body = body;

    Todo.create.mockResolvedValue(newTodo);

    await TodoController.create(req, res, next);

    expect(Todo.create).toHaveBeenCalledWith(params);
    expect(res.json).toHaveBeenCalledWith(newTodo);
  });

  test('Sends create error to error middleware', async () => {
    const body = {
      title: faker.lorem.words()
    };

    req.user._id = faker.random.number();;
    req.body = body;

    const error = new Error(faker.lorem.words());
    Todo.create.mockRejectedValue(error);

    await TodoController.create(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('Updates a todo owned by the user', async () => {
    const ownerId = 1;
    const todo = todos.filter(todo => todo.owner._id === ownerId)[0];
    const body = { title: faker.lorem.words() };
    const result = { ok: 1 };

    req.user._id = ownerId;
    req.params = { id: todo._id };
    req.body = body;

    Todo.updateOne.mockResolvedValue(result);

    await TodoController.update(req, res, next);

    expect(Todo.updateOne).toHaveBeenCalledWith({ _id: todo._id, owner: ownerId }, { ...body, owner: ownerId }, { runValidators: true });
  });

  test('Sends update error to error middleware', async () => {
    const error = new Error(faker.lorem.words());

    req.user._id = faker.random.number();
    req.params = { id: faker.random.number() };

    Todo.updateOne.mockRejectedValue(error);

    await TodoController.update(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  describe('Deleting a Todo', () => {
    test('Deletes a todo', async () => {
      const ownerId = 1;
      const todo = todos.filter(todo => todo.owner._id === ownerId)[0];

      req.user._id = ownerId;
      req.params = { id: todo._id };

      Todo.findById.mockResolvedValue(todo);
      Todo.deleteOne.mockResolvedValue(true);

      await TodoController.delete(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true, id: todo._id });
    });

    test('Returns 404 - Not Found if the todo does not exist', async () => {
      req.params = { id: faker.random.number() };

      Todo.findById.mockResolvedValue(null);

      await TodoController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Todo not found' });
    });

    test('Returns 403 - Forbidden if the todo does not belong to the user', async () => {
      const ownerId = 1;
      const todo = todos.filter(todo => todo.owner._id !== ownerId)[0];

      req.user._id = ownerId;
      req.params = { id: todo._id };

      Todo.findById.mockResolvedValue(todo);

      await TodoController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    test('Sends errors to error middleware', async () => {
      req.user._id = faker.random.number({ min: 1, max: 2 });
      const todo = todos.filter(todo => todo.owner._id === req.user._id)[0];
      req.params = { id: todo._id };
      const error = new Error(faker.lorem.words());

      Todo.findById.mockRejectedValueOnce(error);

      await TodoController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);

      Todo.findById.mockResolvedValue(todo);
      Todo.deleteOne.mockRejectedValue(error);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
