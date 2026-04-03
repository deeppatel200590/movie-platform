import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: function () {
            return !this.googleId; // only required if NOT google user
        }
    },

    googleId: {
        type: String
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
},{timestamps : true});

export default mongoose.model('User', userSchema);