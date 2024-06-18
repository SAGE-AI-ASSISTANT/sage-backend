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
        ref: 'User',
        required: true,
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

const Course = mongoose.model('courses', CourseSchema);
module.exports = Course;