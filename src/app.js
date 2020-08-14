const express = require('express');
const userRouter = require('./routers/user');

const app = express();

app.use(express.json());

app.use('/users', userRouter);

app.get('/', (req, res) => res.send('Hello World!'));

module.exports = app;
