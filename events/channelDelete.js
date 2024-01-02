const Discord = require('discord.js');

module.exports = {
    async execute(client, channel) {
        let auditLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.ChannelDelete }).then(audit => audit.entries.first())
        if (auditLogs.executor.id != client.user.id) {
            if (channel.name.includes('room-')) {
                const numberRoom = channel.name.split('-')[1]
                const usersRoom = await client.database.users.find({ room: Number(numberRoom) })

                usersRoom.forEach(async user => {
                    await client.sleep(1000)
                    await client.database.users.findOneAndUpdate(
                        { guildID: channel.guild.id, userID: user.userID },
                        { $set: { room: null, callOld: null } }
                    )
                })

                let guildInfos = await client.database.guilds.findOne({ guildID: channel.guild.id });
                let channelInfos = await client.database.partidas.findOne({ textChannel: auditLogs.target.id })
                if (channelInfos?.groupOne?.voiceChannel) await channel.guild.channels.cache.get(channelInfos.groupOne.voiceChannel).delete()
                if (channelInfos?.groupTwo?.voiceChannel) await channel.guild.channels.cache.get(channelInfos.groupTwo.voiceChannel).delete()
                if (channelInfos?.generalVoiceChannel) await channel.guild.channels.cache.get(channelInfos.generalVoiceChannel).delete()

                await client.database.partidas.findOneAndDelete({ textChannel: auditLogs.target.id })
            }
        }
    }
}