const express = require('express');
require('./services/passport');
const userRouter = require('./routers/user');
const todoRouter = require('./routers/todo');

const app = express();

app.use(express.json());

app.use('/users', userRouter);
app.use('/todos', todoRouter);

app.get('/', (req, res) => res.send('Hello World!'));

module.exports = app;
