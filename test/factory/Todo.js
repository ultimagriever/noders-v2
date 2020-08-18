const faker = require('faker');

module.exports = {
  getCreateData() {
    return {
      title: faker.lorem.words()
    };
  },
  get(owner) {
    return {
      ...this.getCreateData(),
      status: 'todo',
      owner
    }
  }
};
