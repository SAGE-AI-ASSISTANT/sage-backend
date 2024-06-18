const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    chats: {
        type: Schema.Types.ObjectId,
        ref: 'chats'
    },
    files: [{
        path: {type: String},
        name: {type: String}
    }],
    date: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
})

CourseSchema.pre('remove', async function(next) {
    // Delete courses associated with this user
    await mongoose.model('chats').deleteMany({ _id: { $in: this.chats } });
    next();
});

const Course = mongoose.model('courses', CourseSchema);
module.exports = Course;