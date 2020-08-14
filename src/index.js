const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected succesfully to MongoDB.');
    app.listen(port, () => console.log('Express server listening to requests on port %d', port))
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
