const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let clientSchema = new Schema({
    clientID: { type: String },
    maintenance: { type: Boolean, default: false },
    reason: { type: String, default: null },
    sorryPremium: { type: Array, default: [] },
    chart: {
        lastCommands: { type: Number, default: 0 },
        lastRooms: { type: Number, default: 0 },
        todayCommands: { type: Number, default: 0 },
        todayRooms: { type: Number, default: 0 },
        guilds: { type: Number, default: 0 },
        users: { type: Number, default: 0 },
    },
    cupons: { type: Array, default: [] },
    premiumMessages: { type: Array, default: [] }
});

let Client = mongoose.model("clients", clientSchema);
module.exports = Client;