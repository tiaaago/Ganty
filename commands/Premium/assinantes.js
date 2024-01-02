const Discord = require('discord.js');
module.exports = {
    rank: "premium",
    name: "assinantes",
    description: "Veja os assinantes do servidor.",
    options: [],
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
        if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('Este servidor não possui **PREMIUM**. Caso você seja o dono dele, adquira em `/premium buy`.')
                    .setColor('#B22222')
                    .setFooter({ text: 'Ganty ©' })
            ]
        })

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return;

        const guildUsers = await client.database.users.find({ guildID: interaction.guild.id })

        let currentPage = 1;
        let vlr = 0;
        let minInicial = 0;
        let maxInicial = 10;
        let ordered = guildUsers.filter(c => c.signature?.finalTime != null && c.leaveTimestamp == null).sort((a, b) => a.signature?.finalTime - b.signature?.finalTime).slice(minInicial, maxInicial)
        
        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId('back')
                .setLabel('Voltar')
                .setEmoji('⬅️')
                .setDisabled(false),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId('next')
                .setLabel(`Avançar`)
                .setEmoji('➡️')
                .setDisabled(false)
        )

        const m = await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle('<a:gold_medal_gif:935239544989691936> | Assinantes')
                    .setDescription(`${ordered.length > 0 ? ordered.map((d, i) => `**${i + vlr + 1} - <@${d.userID}>:** <t:${Math.floor(Number(d.signature.finalTime) / Number(1000))}:R>`).join('\n') : `Esse servidor não possui assinantes.`}`)
                    .setColor('#FFA500')
                    .setFooter({ text: `Página ${currentPage}` })
            ],
            components: [row]
        })

        const filter = i => i.user.id == interaction.user.id;
        const collector = m.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (i.replied != true) await i.deferUpdate()

            switch (i.customId) {
                case 'back': {
                    if (currentPage <= 99999 && currentPage >= 1) {
                        currentPage--, vlr = vlr - 10, minInicial = vlr, maxInicial = vlr + 10

                        ordered = guildUsers.filter(c => c.signature?.finalTime != null && c.leaveTimestamp == null).sort((a, b) => a.signature?.finalTime - b.signature?.finalTime).slice(minInicial, maxInicial)
                        if (ordered.length <= 0) return;

                        interaction.editReply({
                            embeds: [new Discord.EmbedBuilder()
                                .setTitle('<a:gold_medal_gif:935239544989691936> | Assinantes')
                                .setDescription(`${ordered.length > 0 ? ordered.map((d, i) => `**${i + vlr + 1} - <@${d.userID}>:** <t:${Math.floor(Number(d.signature.finalTime) / Number(1000))}:R>`).join('\n') : `Esse servidor não possui assinantes.`}`)
                                .setColor('#FFA500')
                                .setFooter({ text: `Página ${currentPage}` })]
                        })
                    }
                    break;
                }

                case 'next': {
                    if (currentPage < 99999) {
                        currentPage++, vlr = vlr + 10, minInicial = vlr, maxInicial = vlr + 10

                        ordered = guildUsers.filter(c => c.signature?.finalTime != null && c.leaveTimestamp == null).sort((a, b) => a.signature?.finalTime - b.signature?.finalTime).slice(minInicial, maxInicial)
                        if (ordered.length <= 0) return;

                        interaction.editReply({
                            embeds: [new Discord.EmbedBuilder()
                                .setTitle('<a:gold_medal_gif:935239544989691936> | Assinantes')
                                .setDescription(`${ordered.length > 0 ? ordered.map((d, i) => `**${i + vlr + 1} - <@${d.userID}>:** <t:${Math.floor(Number(d.signature.finalTime) / Number(1000))}:R>`).join('\n') : `Esse servidor não possui assinantes.`}`)
                                .setColor('#FFA500')
                                .setFooter({ text: `Página ${currentPage}` })]
                        })
                    }
                    break;
                }
            }
        })

    }
}