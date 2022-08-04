const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, { versionKey: false })

module.exports = mongoose.model("USERS", userSchema)