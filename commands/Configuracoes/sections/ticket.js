const Discord = require('discord.js')
module.exports = {
    name: 'Ticket',
    description: 'Gerencie os tickets do seu servidor.',
    emoji: '998760958606463016',
    value: 'ticket',
    premiumConfig: false,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            let menuOptions = [
                {
                    label: 'Voltar para a página inicial',
                    description: 'Clique aqui para voltar para a página inicial do dashboard.',
                    emoji: '992173657067634808',
                    value: 'homepage',
                },
                {
                    label: 'ㅤ',
                    value: 'nullOption1',
                },
                {
                    label: 'Configurar | Categoria',
                    description: 'Clique aqui para setar a categoria que os tickets ficarão.',
                    value: 'setCategory',
                    emoji: '998760958606463016'
                },
                {
                    label: 'Configurar | Canal',
                    description: 'Clique aqui para setar o canal que a mensagem de ticket ficará.',
                    value: 'setChannel',
                    emoji: '998760958606463016'
                },
                {
                    label: 'Configurar | Cargo',
                    description: 'Clique aqui para setar o cargo de atendentes.',
                    value: 'setRole',
                    emoji: '998760958606463016'
                },
            ]

            let embed = new Discord.EmbedBuilder()
                .setTitle("Dashboard — Ticket")
                .setColor('#B9D3EE')
                .setDescription("Seja bem vindo ao painel de gerenciamento de ticket, aqui você pode - sem muita dificuldade - gerenciar a categoria que os tickets ficarão, cargo de atendente e as logs.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                .addFields([
                    { name: 'Categoria', value: `${guildInfos.ticket.category ? `${interaction.guild.channels.cache.get(guildInfos.ticket.category)} (${guildInfos.ticket.category})` : 'Não definido'}` },
                    { name: 'Canal', value: `${guildInfos.ticket.channel ? `${interaction.guild.channels.cache.get(guildInfos.ticket.channel)} (${guildInfos.ticket.channel})` : 'Não definido'}` },
                    { name: 'Cargo', value: `${guildInfos.ticket.role ? `${interaction.guild.roles.cache.get(guildInfos.ticket.role)} (${guildInfos.ticket.role})` : 'Não definido'}` }
                ])
                .setFooter({ text: 'Ganty ©' })
                .setTimestamp()

            if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                menuOptions.push(
                    {
                        label: 'ㅤ',
                        value: 'nullOption2',
                    },
                    {
                        label: 'Configurar | Canal de logs',
                        description: 'Clique aqui para setar o canal de logs dos tickets.',
                        value: 'setTicketLogs',
                        emoji: '1008518050313670666'
                    })

                embed.addFields([{ name: `Canal de Logs`, value: `${guildInfos.ticket.logs ? `${interaction.guild.channels.cache.get(guildInfos.ticket.logs)} (${guildInfos.ticket.logs})` : 'Não definido'}` }])
            }

            interaction.editReply({
                embeds: [embed],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configTicket')
                                .setPlaceholder('Selecione a ação que você deseja executar')
                                .setMinValues(1)
                                .setMaxValues(1)
                                .setDisabled(disabled)
                                .addOptions(menuOptions),
                        )
                ]
            })
        }

        await attMainMessage(interaction, false);

        const intMsg = await interaction.fetchReply()
        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            await attMainMessage(interaction, false);
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id });

            switch (i.values[0]) {
                case 'homepage': {
                    if (i.replied != true) await i.deferUpdate()
                    const dashboardHomepage = require('../dashboard.js')

                    collector.stop('back to homepage')
                    dashboardHomepage.execute(client, interaction, args, true)
                    break;
                } // homePage

                case "setCategory": {
                    await i.deferReply();

                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, a categoria que você deseja adicionar.`,
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ChannelSelectMenuBuilder()
                                        .setChannelTypes(Discord.ChannelType.GuildCategory)
                                        .setCustomId('channelMenu')
                                        .setPlaceholder(`Selecione a categoria desejado`)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = selectMessage.createMessageComponentCollector({ filter, time: 30000 });

                    collector.on('collect', async int => {
                        selectMessage.delete()

                        const channelInfos = interaction.guild.channels.cache.get(int.values[0])

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "ticket.category": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`A categoria **${channelInfos.name}** foi definida como a categoria de tickets.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // setCategory

                case "setChannel": {
                    await i.deferReply();
                    
                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, o canal que você deseja adicionar.`,
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ChannelSelectMenuBuilder()
                                        .setChannelTypes(Discord.ChannelType.GuildText)
                                        .setCustomId('channelMenu')
                                        .setPlaceholder(`Selecione o canal desejado`)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = selectMessage.createMessageComponentCollector({ filter, time: 30000 });

                    collector.on('collect', async int => {
                        selectMessage.delete()

                        const channelInfos = interaction.guild.channels.cache.get(int.values[0])

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "ticket.channel": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`A categoria **${channelInfos.name}** foi definida como a categoria de tickets.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        await channelInfos.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setTitle('📫 | Ticket')
                                    .setDescription('Olá, é um prazer te ver aqui! Se você está precisando de ajuda, aqui é o lugar certo.\nClique no botão abaixo para abrir um ticket e solicitar atendimento de algum Staff do servidor.')
                                    .setColor('#63B8FF')
                            ], components: [
                                new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.ButtonBuilder()
                                            .setStyle(Discord.ButtonStyle.Primary)
                                            .setCustomId('openTicket')
                                            .setLabel('Abrir Ticket')
                                            .setEmoji('📫')
                                            .setDisabled(false)
                                    )
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // setChannel

                case "setRole": {
                    await i.deferReply();

                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, o cargo que você deseja adicionar.`,
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.RoleSelectMenuBuilder()
                                        .setCustomId('roleMenu')
                                        .setPlaceholder(`Selecione o cargo desejado`)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = selectMessage.createMessageComponentCollector({ filter, time: 30000 });

                    collector.on('collect', async int => {
                        selectMessage.delete()

                        const roleInfos = interaction.guild.roles.cache.get(int.values[0])

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "ticket.role": roleInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O cargo ${roleInfos} foi definido como o cargo de atendente de tickets.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // setRole

                case "setTicketLogs": {
                    await i.deferReply();

                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, o canal que você deseja adicionar.`,
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ChannelSelectMenuBuilder()
                                        .setChannelTypes(Discord.ChannelType.GuildText)
                                        .setCustomId('channelMenu')
                                        .setPlaceholder(`Selecione o canal desejado`)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = selectMessage.createMessageComponentCollector({ filter, time: 30000 });

                    collector.on('collect', async int => {
                        selectMessage.delete()

                        const channelInfos = interaction.guild.channels.cache.get(int.values[0])

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "ticket.logs": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O canal ${channelInfos} foi definido como o canal de logs de tickets.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // setTicketLogs

            }
        })
    }
}