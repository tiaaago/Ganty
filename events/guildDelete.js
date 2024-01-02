const Discord = require('discord.js');

module.exports = {
    async execute(client, guild) {
        if(guild && guild.id != "1068135541360578590") {
            client.guilds.cache.get('972930558210478162').channels.cache.get('992075775102681150').send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle('-1 SERVIDOR!')
                        .setDescription(`Fui removido de ${guild.name} (${guild.id}) e agora estou em ${client.guilds.cache.size} servidores.`)
                        .setColor('#FF4040')
                ]
            })
            await client.database.guilds.findOneAndUpdate(
                { guildID: guild.id },
                { $set: { leaveTimestamp: Date.now() } }
            )
        }
    }
}