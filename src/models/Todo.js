const mongoose = require('mongoose');
const { Schema } = mongoose;

const TodoSchema = new Schema({
  title: String,
  status: {
    type: String,
    required: true,
    enum: ['todo', 'doing', 'done'],
    default: 'todo'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
}, { timestamps: true });

const Todo = mongoose.model('todo', TodoSchema);

module.exports = Todo;
