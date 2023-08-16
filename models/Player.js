const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: { 
        type: String, required: true, unique: true
     },
    email: {
        type: String, unique: true
    },
    totalPuzzlesDone: {
        type: Number,
    },
    puzzle10x: {
        puzzle3min: {
            type: Number,
            default: 0
        },
        puzzle5min: {
            type: Number,
            default: 0
        },
        puzzle10min: {
            type: Number,
            default: 0
        },
        puzzle15min: {
            type: Number,
            default: 0
        },
    },
    password: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
    },
    accountConfirmed: {
        type: Boolean,
        default: false
    },
    level: {
        type: Number,
        default: 1
    }
});

const Player = mongoose.model("Player", playerSchema);

module.exports = Player