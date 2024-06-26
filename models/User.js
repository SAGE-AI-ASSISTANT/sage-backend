const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'courses',
    }],
    avatar: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }

})

const User = mongoose.model('users', UserSchema);
module.exports = User;