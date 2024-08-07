const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    token: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    email_otp: {
        type: String
    },
    email_otp_expiry: {
        type: String
    },
    verify_email: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);


const user = new mongoose.model("user", userSchema);
module.exports = user;