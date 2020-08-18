const faker = require('faker');
const jwt = require('jwt-simple');

module.exports = {
  getCreateData() {
    return {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
  },
  getAuthToken(user) {
    const timestamp = (new Date()).getTime();

    return jwt.encode({ sub: user._id, iat: timestamp }, process.env.JWT_SECRET_KEY);
  }
};
