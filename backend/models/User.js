const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    address: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: '',
        match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number.']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'retailer'],
        default: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }    
});

userSchema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;