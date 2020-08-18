const jwt = require('jwt-simple');
const User = require('../models/User');

function encodeJwt(user) {
  const timestamp = (new Date()).getTime();

  return jwt.encode({
    sub: user._id,
    iat: timestamp
  }, process.env.JWT_SECRET_KEY);
}

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
      if (email) user.email  = email;
      if (password) user.password = password;

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
  authenticate(req, res) {
    res.status(200).json({ token: encodeJwt(req.user) });
  }
};
