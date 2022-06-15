const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    song:{
        type: String,
        required: true
    },
    rating:{
        type: String,
        required: true
    }
}, {timestamps: true})

const Feedback = mongoose.model('Feedback',feedbackSchema)

module.exports = Feedback;