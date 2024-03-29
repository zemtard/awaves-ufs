const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    session_id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    payload: {
      type: Object,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const custom = mongoose.model("custom", feedbackSchema);

module.exports = custom;
