const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({

    username: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    OTP_VerficationToken: {
        OTP: String,
        expires: Date
    },
    verficationToken: {
        token: String,
        expires: Date
    }

})

const UserModel = mongoose.model('Users', UserSchema)

module.exports = UserModel