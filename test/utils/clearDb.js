const mongoose = require('mongoose');

function deleteCollection(collection) {
  return new Promise((resolve) => {
    mongoose.connection.collections[collection].remove(resolve);
  });
}

module.exports = () => Promise.all(Object.keys(mongoose.connection.collections).map(deleteCollection));
