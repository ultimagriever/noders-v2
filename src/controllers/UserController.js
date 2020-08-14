const User = require('../models/User');

module.exports = {
  async list(req, res, next) {
    try {
      const users = await User.find({});

      res.json(users);
    } catch (err) {
      next(err);
    }
  },
  async get(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      res.json(user);
    } catch (err) {
      next(err);
    }
  },
  async create(req, res, next) {
    try {
      const { email, password } = req.body;
      const newUser = new User();
      newUser.email = email;
      newUser.password = password;

      await newUser.save();

      res.status(201).json({ success: true, email });
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { email, password } = req.body;
      const user = await User.findById(id);
      user.email  = email;
      user.password = password;

      await user.save();

      res.json({ success: true, email });
    } catch (err) {
      next(err);
    }
  },
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await User.findByIdAndRemove(id);

      res.json({ success: true, id });
    } catch (err) {
      next(err);
    }
  },
  async authenticate(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      const unauthorized = { status: 401, message: 'Invalid username and/or password' };

      if (!user) {
        return next(unauthorized);
      }

      user.comparePassword(password, function (err, isMatch) {
        if (err) return next(err);

        if (!isMatch) return next(unauthorized);

        res.json({ success: true });
      });
    } catch (err) {
      next(err);
    }
  }
};
