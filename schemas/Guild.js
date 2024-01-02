const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let configsSchema = new Schema({
    guildID: { type: String },
    permissions: {
        anychatcommand: { type: Array },
        closefila: { type: Array },
        closeroom: { type: Array },
        commandaddremovepoints: { type: Array },
        commandadv: { type: Array },
        commandconfig: { type: Array },
        commandgerarcoderemassinatura: { type: Array },
        commandsetupranked: { type: Array },
        managesystems: { type: Array },
        seeroomschannel: { type: Array }
    },
    adv: {
        channel: { type: String },
        punishments: { type: Array }
    },
    assinatura: {
        cupons: { type: Array, default: [] },
        channel: { type: String },
        roleFix: { type: String },
        roles: { type: Array },
        apiKey: { type: String },
    },
    codes: [{ code: String, signature: String, time: String }],
    configs: {
        commandChannels: { type: Array },
        filasChannels: { type: Array },
        filasState: {
            v1: { type: Boolean, default: true },
            v2: { type: Boolean, default: true },
            v3: { type: Boolean, default: true },
            v4: { type: Boolean, default: true },
            v5: { type: Boolean, default: true },
        },
        voiceChannels: { type: Array },
        category: { type: String },
        points: {
            win: { type: Number, default: 50 },
            lose: { type: Number, default: 25 },
            mvp: { type: Number, default: 10 },
            consecutives: { type: Number, default: 3 }
        }
    },
    countRooms: { type: Number, default: 1 },
    dailyRooms: { type: Number, default: 0 },
    leaveTimestamp: { type: Number },
    logs: {
        roomLogs: { type: String },
        commandLogs: { type: String }
    },
    padroes: {
        msgRoom: { type: String },
        layoutRoom: { type: Number, default: 1 }
    },
    premium: {
        active: { type: Boolean, default: false },
        type: { type: String, default: null },
        finalTime: { type: Number },
        lastBuyTime: { type: Number },
        paymentId: { type: String },
    },
    ranks: [{ rank: String, points: Number }],
    systems: {
        activated: { type: Array, default: ['mvp', 'ranks'] },
        desactivated: { type: Array, default: ['gantypay', 'nobots'] }
    },
    ticket: {
        category: { type: String },
        channel: { type: String },
        role: { type: String },
        logs: { type: String },
    },
});

let Guild = mongoose.model("guilds", configsSchema);
module.exports = Guild;