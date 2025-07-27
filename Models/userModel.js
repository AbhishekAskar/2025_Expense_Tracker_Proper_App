const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  totalExpense: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); 

const User = mongoose.model("User", userSchema);

module.exports = User;
