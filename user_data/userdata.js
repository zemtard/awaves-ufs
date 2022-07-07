const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({

    session_length:{
        type: Number,
        required: true
    },
    ip:{
        type: String,
        required: true
    },
    device:{
        type: String,
        required: true
    },
    browser:{
        type: String,
        required: true
    },
    OS:{
        type: String,
        required: true
    },
    version:{
        type: String,
        required: true
    }

}, {timestamps: true})

const user_data = mongoose.model('user_data',feedbackSchema)

module.exports = user_data;