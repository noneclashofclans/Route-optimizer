const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String, 
        required: true
    },
    email:{
        type: String,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true, 
        minlength: 5,
        match: /^(?=.*[!@#$%^&*])/
    },
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);