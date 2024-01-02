const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let usersSchema = new Schema({
    guildID: { type: String },
    userID: { type: String },
    nick: { type: String },
    points: { type: Number, default: 0 },
    win: { type: Number, default: 0 },
    lose: { type: Number, default: 0 },
    mvp: { type: Number, default: 0 },
    consecutives: { type: Number, default: 0 },
    adv: { type: Array },
    signature: {
        finalTime: { type: Number },
        lastSignTime: { type: Number },
        role: { type: String },
        paymentId: { type: String }
    },
    room: { type: String },
    callOld: { type: String },
    cooldown: { type: Number },
    leaveTimestamp: { type: Number },
});

let Users = mongoose.model("users", usersSchema);
module.exports = Users;