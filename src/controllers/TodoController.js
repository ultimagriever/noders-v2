const Todo = require('../models/Todo');

module.exports = {
  async list(req, res, next) {
    try {
      const todos = await Todo.find({ owner: req.user._id });

      res.json(todos);
    } catch (err) {
      next(err);
    }
  },
  async find(req, res, next) {
    try {
      const todo = await Todo.findById(req.params.id);

      if (!(todo && String(todo.owner._id) === String(req.user._id))) {
        return res.status(404).json({ message: 'Todo not found' });
      }

      res.json(todo);
    } catch (err) {
      next(err);
    }
  },
  async create(req, res, next) {
    try {
      const params = { ...req.body, owner: req.user._id };

      const newTodo = await Todo.create(params);

      res.status(201).json(newTodo);
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const updatedTodo = await Todo.updateOne({ _id: req.params.id, owner: req.user._id }, { ...req.body, owner: req.user._id });

      res.json(updatedTodo);
    } catch (err) {
      next(err);
    }
  },
  async delete(req, res, next) {
    try {
      const todo = await Todo.findById(req.params.id);

      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }

      if (String(todo.owner._id) !== String(req.user._id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await Todo.deleteOne({ _id: req.params.id });

      res.json({ success: true, id: req.params.id });
    } catch (err) {
      next(err);
    }
  }
};
