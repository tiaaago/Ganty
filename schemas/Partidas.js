const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let partidasSchema = new Schema({
    guildID: { type: String },
    code: { type: String },
    textChannel: { type: String },
    generalVoiceChannel: { type: String },
    isWinnerDefined: { type: Boolean, default: false },
    isMVPDefined: { type: Boolean, default: false },
    haveMVP: { type: Boolean },
    groupOne: {
        voiceChannel: { type: String },
        players: { type: Array }
    },
    groupTwo: {
        voiceChannel: { type: String },
        players: { type: Array }
    }
});

let Partidas = mongoose.model("partidas", partidasSchema);
module.exports = Partidas;