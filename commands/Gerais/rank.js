const Discord = require('discord.js')
module.exports = {
    rank: "everyone",
    name: "rank",
    description: "Veja o ranking de pontos do servidor.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'points',
            description: 'Veja o rank de pontos.',
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'wins',
            description: 'Veja o rank de vitórias.',
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'losses',
            description: 'Veja o rank de derrotas.',
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'mvps',
            description: 'Veja o rank de MVPs.',
        },
    ],
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        let pages = 10;
        if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) pages = 99999;

        let action = args[0].toLowerCase()

        if (action == 'points') {
            let currentPage = 1;
            let vlr = 0;
            let minInicial = 0;
            let maxInicial = 10;

            const guildUsers = await client.database.users.find({ guildID: interaction.guild.id })
            let ordered = guildUsers.sort((a, b) => b.points - a.points).slice(minInicial, maxInicial).filter(c => c.points)
            let notChange = guildUsers.sort((a, b) => b.points - a.points)

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
                embeds: [new Discord.EmbedBuilder()
                    .setTitle('<:moedinha:935240282159579187> | Rank de Pontos')
                    .setDescription(ordered.length > 0 ? ordered.map((d, i) => `**${i + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.points)} pontos`).join('\n') : 'Este servidor não possui ninguém no rank.')
                    .addFields([
                        { name: `Sua posição:`, value: notChange.find(c => c.userID == interaction.user.id) ? `#${notChange.findIndex(c => c.userID == interaction.user.id) + 1} - ${notChange.find(c => c.userID == interaction.user.id).points} pontos` : `Você não está no rank` }
                    ])
                    .setColor('#458B74')
                    .setFooter({ text: `Página ${currentPage}` })], components: [row]
            })

            const filter = i => i.user.id == interaction.user.id;
            const collector = m.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.replied != true) await i.deferUpdate()

                switch (i.customId) {
                    case 'back': {
                        if (currentPage <= pages && currentPage >= 1) {
                            currentPage--, vlr = vlr - 10, minInicial = vlr, maxInicial = vlr + 10

                            ordered = guildUsers.sort((a, b) => b.points - a.points).slice(minInicial, maxInicial).filter(c => c.points)
                            if (ordered.length <= 0) return;

                            interaction.editReply({
                                embeds: [new Discord.EmbedBuilder()
                                    .setTitle('<:moedinha:935240282159579187> | Rank de Pontos')
                                    .setDescription(ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.points)} pontos`).join('\n'))
                                    .setColor('#458B74')
                                    .setFooter({ text: `Página ${currentPage}` })]
                            })
                        }
                        break;
                    }

                    case 'next': {
                        if (currentPage < pages) {
                            currentPage++, vlr = vlr + 10, minInicial = vlr, maxInicial = vlr + 10

                            ordered = guildUsers.sort((a, b) => b.points - a.points).slice(minInicial, maxInicial).filter(c => c.points)
                            if (ordered.length <= 0) return;

                            interaction.editReply({
                                embeds: [new Discord.EmbedBuilder()
                                    .setTitle('<:moedinha:935240282159579187> | Rank de Pontos')
                                    .setDescription(ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.points)} pontos`).join('\n'))
                                    .setColor('#458B74')
                                    .setFooter({ text: `Página ${currentPage}` })]
                            })
                        }
                        break;
                    }
                }
            })
        }

        if (action == 'wins') {
            if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Este servidor não possui **PREMIUM**. Caso você seja o dono dele, adquira em `/premium buy`.')
                        .setColor('#B22222')
                        .setFooter({ text: 'Ganty ©' })
                ]
            })

            let currentPage = 1;
            let vlr = 0;
            let minInicial = 0;
            let maxInicial = 10;

            const guildUsers = await client.database.users.find({ guildID: interaction.guild.id })
            let ordered = guildUsers.sort((a, b) => b.win - a.win).slice(minInicial, maxInicial).filter(c => c.win)

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
                embeds: [new Discord.EmbedBuilder()
                    .setTitle('<a:sparkles_gif:935239104885559356> | Rank de Vitórias')
                    .setDescription(ordered.length > 0 ? ordered.map((d, i) => `** ${i + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.win)} vitórias`).join('\n') : 'Este servidor não possui ninguém no rank.')
                    .setColor('#458B74')
                    .setFooter({ text: `Página ${currentPage}` })], components: [row]
            })

            const filter = i => i.user.id == interaction.user.id;
            const collector = m.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.replied != true) await i.deferUpdate()

                switch (i.customId) {
                    case 'back': {
                        if (currentPage <= pages && currentPage >= 1) {
                            currentPage--, vlr = vlr - 10, minInicial = vlr, maxInicial = vlr + 10

                            ordered = guildUsers.sort((a, b) => b.win - a.win).slice(minInicial, maxInicial).filter(c => c.win)
                            if (ordered.length <= 0) return;

                            interaction.editReply({
                                embeds: [new Discord.EmbedBuilder()
                                    .setTitle('<a:sparkles_gif:935239104885559356> | Rank de Vitórias')
                                    .setDescription(ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.win)} vitórias`).join('\n'))
                                    .setColor('#458B74')
                                    .setFooter({ text: `Página ${currentPage}` })]
                            })
                        }
                        break;
                    }

                    case 'next': {
                        if (currentPage < pages) {
                            currentPage++, vlr = vlr + 10, minInicial = vlr, maxInicial = vlr + 10

                            ordered = guildUsers.sort((a, b) => b.win - a.win).slice(minInicial, maxInicial).filter(c => c.win)
                            if (ordered.length <= 0) return;

                            interaction.editReply({
                                embeds: [new Discord.EmbedBuilder()
                                    .setTitle('<a:sparkles_gif:935239104885559356> | Rank de Vitórias')
                                    .setDescription(ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.win)} vitórias`).join('\n'))
                                    .setColor('#458B74')
                                    .setFooter({ text: `Página ${currentPage}` })]
                            })
                        }
                        break;
                    }
                }
            })
        }

        if (action == 'losses') {
            if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Este servidor não possui **PREMIUM**. Caso você seja o dono dele, adquira em `/premium buy`.')
                        .setColor('#B22222')
                        .setFooter({ text: 'Ganty ©' })
                ]
            })

            let currentPage = 1;
            let vlr = 0;
            let minInicial = 0;
            let maxInicial = 10;

            const guildUsers = await client.database.users.find({ guildID: interaction.guild.id })
            let ordered = guildUsers.sort((a, b) => b.lose - a.lose).slice(minInicial, maxInicial).filter(c => c.lose)

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
                embeds: [new Discord.EmbedBuilder()
                    .setTitle('<:bang:935240316661923850> | Rank de Derrotas')
                    .setDescription(ordered.length > 0 ? ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.lose)} derrotas`).join('\n') : 'Este servidor não possui ninguém no rank.')
                    .setColor('#458B74')
                    .setFooter({ text: `Página ${currentPage}` })], components: [row]
            })

            const filter = i => i.user.id == interaction.user.id;
            const collector = m.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.replied != true) await i.deferUpdate()

                switch (i.customId) {
                    case 'back': {
                        if (currentPage <= pages && currentPage >= 1) {
                            currentPage--, vlr = vlr - 10, minInicial = vlr, maxInicial = vlr + 10

                            ordered = guildUsers.sort((a, b) => b.lose - a.lose).slice(minInicial, maxInicial).filter(c => c.lose)
                            if (ordered.length <= 0) return;

                            interaction.editReply({
                                embeds: [new Discord.EmbedBuilder()
                                    .setTitle('<:bang:935240316661923850> | Rank de Derrotas')
                                    .setDescription(ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.lose)} derrotas`).join('\n'))
                                    .setColor('#458B74')
                                    .setFooter({ text: `Página ${currentPage}` })]
                            })
                        }
                        break;
                    }

                    case 'next': {
                        if (currentPage < pages) {
                            currentPage++, vlr = vlr + 10, minInicial = vlr, maxInicial = vlr + 10

                            ordered = guildUsers.sort((a, b) => b.lose - a.lose).slice(minInicial, maxInicial).filter(c => c.lose)
                            if (ordered.length <= 0) return;

                            interaction.editReply({
                                embeds: [new Discord.EmbedBuilder()
                                    .setTitle('<:bang:935240316661923850> | Rank de Derrotas')
                                    .setDescription(ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.lose)} derrotas`).join('\n'))
                                    .setColor('#458B74')
                                    .setFooter({ text: `Página ${currentPage}` })]
                            })
                        }
                        break;
                    }
                }
            })
        }

        if (action == 'mvps') {
            if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Este servidor não possui **PREMIUM**. Caso você seja o dono dele, adquira em `/premium buy`.')
                        .setColor('#B22222')
                        .setFooter({ text: 'Ganty ©' })
                ]
            })

            let currentPage = 1;
            let vlr = 0;
            let minInicial = 0;
            let maxInicial = 10;

            const guildUsers = await client.database.users.find({ guildID: interaction.guild.id })
            let ordered = guildUsers.sort((a, b) => b.mvp - a.mvp).slice(minInicial, maxInicial).filter(c => c.mvp)

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
                embeds: [new Discord.EmbedBuilder()
                    .setTitle('<a:crystalball_gif:935240803251552326> | Rank de MVPs')
                    .setDescription(ordered.length > 0 ? ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.mvp)} mvps`).join('\n') : 'Este servidor não possui ninguém no rank.')
                    .setColor('#458B74')
                    .setFooter({ text: `Página ${currentPage}` })], components: [row]
            })

            const filter = i => i.user.id == interaction.user.id;
            const collector = m.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.replied != true) await i.deferUpdate()

                switch (i.customId) {
                    case 'back': {
                        if (currentPage <= pages && currentPage >= 1) {
                            currentPage--, vlr = vlr - 10, minInicial = vlr, maxInicial = vlr + 10

                            ordered = guildUsers.sort((a, b) => b.mvp - a.mvp).slice(minInicial, maxInicial).filter(c => c.mvp)
                            if (ordered.length <= 0) return;

                            interaction.editReply({
                                embeds: [new Discord.EmbedBuilder()
                                    .setTitle('<a:crystalball_gif:935240803251552326> | Rank de MVPs')
                                    .setDescription(ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.mvp)} mvps`).join('\n'))
                                    .setColor('#458B74')
                                    .setFooter({ text: `Página ${currentPage}` })]
                            })
                        }
                        break;
                    }

                    case 'next': {
                        if (currentPage < pages) {
                            currentPage++, vlr = vlr + 10, minInicial = vlr, maxInicial = vlr + 10

                            ordered = guildUsers.sort((a, b) => b.mvp - a.mvp).slice(minInicial, maxInicial).filter(c => c.mvp)
                            if (ordered.length <= 0) return;

                            interaction.editReply({
                                embeds: [new Discord.EmbedBuilder()
                                    .setTitle('<a:crystalball_gif:935240803251552326> | Rank de MVPs')
                                    .setDescription(ordered.map((d, i) => `** ${i + vlr + 1} - <@${d.userID}>:** ${new Intl.NumberFormat('de-DE').format(d.mvp)} mvps`).join('\n'))
                                    .setColor('#458B74')
                                    .setFooter({ text: `Página ${currentPage}` })]
                            })
                        }
                        break;
                    }
                }
            })
        }
    }
}