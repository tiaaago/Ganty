const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let usersSchema = new Schema({
    userID: { type: String },
    blacklisted: {
        state: { type: Boolean },
        reason: { type: String },
        staff: { type: String },
        finalTime: { type: Number }
    },
});

let Users = mongoose.model("globalusers", usersSchema);
module.exports = Users;