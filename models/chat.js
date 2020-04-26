const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
},
{
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);