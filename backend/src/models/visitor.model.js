const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    employeeEmail: {
        type: String,
        required: true
    },
    visitDate: {
        type: Date,
        required: true
    },
    visitTime: {
        type: String,
        required: true
    },
    additionalNotes: {
        type: String
    },
    image: {
        data: Buffer,
        contentType: String
    },
    status: {
        type: String,
        enum: ['pending', 'pre-approved', 'approved', 'rejected', 'visited'],
        default: 'pending'
    },
    actualVisitTime: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Visitor', visitorSchema); 