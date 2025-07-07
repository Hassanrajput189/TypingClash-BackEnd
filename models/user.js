import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    highScore: {
        wpm: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        date: { type: Date },
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
export const User = mongoose.model("user",schema);