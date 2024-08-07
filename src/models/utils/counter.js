var mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    seq: {
        type: Number,
    },
});
  
  const Counter = mongoose.model('counter', counterSchema)
  module.exports = Counter;

