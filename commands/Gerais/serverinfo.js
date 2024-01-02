const Discord = require('discord.js')
const moment = require('moment-timezone')
moment.locale('pt-br')
module.exports = {
    rank: "everyone",
    name: "serverinfo",
    description: "Veja as informações do servidor.",
    options: [],
    async execute(client, interaction, args) {
        let guildDb = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(interaction.guild.name)
                    .addFields([
                        { name: '🦉 Nome do Servidor', value: `${interaction.guild.name} ${Discord.inlineCode(`(${interaction.guild.id})`)}`, inline: true },
                        { name: '💻 Shard:', value: 'Shard 1 — Ganty', inline: true },
                        { name: '👥 Membros:', value: `${interaction.guild.memberCount}`, inline: true },
                        { name: '👑 Dono:', value: `${interaction.guild.members.cache.get(interaction.guild.ownerId)} ${Discord.inlineCode(`(${interaction.guild.ownerId})`)}`, inline: true },
                        { name: '📥 Data de Entrada:', value: `${moment.tz(interaction.member.joinedAt, "America/Sao_Paulo").format('LLL')}`, inline: true },
                        { name: '🧮 Estatísticas do Servidor', value: `Partidas Diárias: ${guildDb.dailyRooms}/${guildDb.premium.type == 'normal' ? '∞' : guildDb.premium.type == 'booster' ? '15' : '5'}` },
                        { name: '🧩 Premium', value: guildDb.premium.active ? `Tempo de ${guildDb.premium.type == "normal" ? "PREMIUM" : "BOOSTER"}: <t:${Math.floor(Number(guildDb.premium.finalTime) / Number(1000))}:R>` : 'Seu servidor não possui PREMIUM.' },
                    ])

                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 2048 }))
                    .setColor('#553aa7')
            ]
        })
    }
}