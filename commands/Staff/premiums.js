const Discord = require('discord.js');
module.exports = {
    rank: "dev",
    name: "premiums",
    description: "Veja os assinantes premium.",
    options: [],
    async execute(client, interaction, args) {
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return;

        const guilds = await client.database.guilds.find()

        let currentPage = 1;
        let vlr = 0;
        let minInicial = 0;
        let maxInicial = 10;
        let ordered = guilds.filter(c => c.premium?.finalTime).sort((a, b) => a.premium.finalTime - b.premium.finalTime).slice(minInicial, maxInicial)

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
                    .setDescription(ordered.map((d, i) => `**${i + vlr + 1} - ${client.guilds.cache.get(d.guildID) ? client.guilds.cache.get(d.guildID).name : d.guildID}:** <t:${Math.floor(Number(d.premium.finalTime) / Number(1000))}:R>`).join('\n'))
                    .setColor('#FFA500')
                    .setFooter({ text: `Página ${currentPage}` })
            ],
            components: [row]
        })

        const filter = i => i.user.id == interaction.member.id;
        const collector = m.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (i.replied != true) await i.deferUpdate()

            switch (i.customId) {
                case 'back': {
                    if (currentPage <= 99999 && currentPage >= 1) {
                        currentPage--, vlr = vlr - 10, minInicial = vlr, maxInicial = vlr + 10

                        ordered = ordered.sort((a, b) => a.premium.finalTime - b.premium.finalTime).slice(minInicial, maxInicial)
                        if (ordered.length <= 0) return;

                        interaction.editReply({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setTitle('<a:gold_medal_gif:935239544989691936> | Assinantes')
                                    .setDescription(ordered.map((d, i) => `**${i + vlr + 1} - ${client.guilds.cache.get(d.guildID) ? client.guilds.cache.get(d.guildID).name : d.guildID}:** <t:${Math.floor(Number(d.premium.finalTime) / Number(1000))}:R>`).join('\n'))
                                    .setColor('#FFA500')
                                    .setFooter({ text: `Página ${currentPage}` })]
                        })
                    }
                    break;
                }

                case 'next': {
                    if (currentPage < 99999) {
                        currentPage++, vlr = vlr + 10, minInicial = vlr, maxInicial = vlr + 10

                        ordered = ordered.sort((a, b) => a.premium.finalTime - b.premium.finalTime).slice(minInicial, maxInicial)
                        if (ordered.length <= 0) return;

                        interaction.editReply({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setTitle('<a:gold_medal_gif:935239544989691936> | Assinantes')
                                    .setDescription(ordered.map((d, i) => `**${i + vlr + 1} - ${client.guilds.cache.get(d.guildID) ? client.guilds.cache.get(d.guildID).name : d.guildID}:** <t:${Math.floor(Number(d.premium.finalTime) / Number(1000))}:R>`).join('\n'))
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