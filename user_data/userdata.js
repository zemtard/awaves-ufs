const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    session_id: {
      type: String,
      required: true,
    },
    session_length: {
      type: Number,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    device: {
      type: {
        type: String,
        required: false,
      },
      model: {
        type: String,
        required: false,
      },
    },
    browser: {
      type: String,
      required: true,
    },
    OS: {
      name: {
        type: String,
        required: false,
      },
      version: {
        type: String,
        required: false,
      },
    },
    version: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const user_data = mongoose.model("user_data", feedbackSchema);

module.exports = user_data;
