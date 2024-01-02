const Discord = require('discord.js');

module.exports = {
    async execute(client, oldState, newState) {
        const partidas = await client.database.partidas.find({ guildID: newState.guild.id })
        const findPartida = partidas.find(partida => partida.generalVoiceChannel == newState.channelId || partida.groupOne.voiceChannel == newState.channelId || partida.groupTwo.voiceChannel == newState.channelId)

        if (newState?.channelId && newState.member.user.bot && findPartida) {
            let guildInfos = await client.database.guilds.findOne({ guildID: newState.guild.id });
            if (!guildInfos) return;
            if (guildInfos.systems.activated.find(system => system == "nobots")) return newState.disconnect()
        }
    }
}