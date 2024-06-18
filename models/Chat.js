const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'courses',
        required: true
    },
    messages: [{
        role: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now()
        }
    }]
}, {
    timestamps: true
})


const Chat = mongoose.model('chats', ChatSchema);
module.exports = Chat;