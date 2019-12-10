const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  users: [],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message"
    }
  ],
  created_at: Date,
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);
