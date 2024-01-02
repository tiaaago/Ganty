const Discord = require('discord.js')
module.exports = {
    name: 'Logs',
    description: 'Gerencie os canais de logs.',
    emoji: '1008518050313670666',
    value: 'logs',
    premiumConfig: true,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Logs")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de gerenciamento de logs, aqui você pode - sem muita dificuldade - gerenciar os canais de logs de partidas e comandos.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields([
                            { name: 'Logs de Comandos', value: `${guildInfos.logs.commandLogs ? `${interaction.guild.channels.cache.get(guildInfos.logs.commandLogs)} (${guildInfos.logs.commandLogs})` : 'Não definida'}` },
                            { name: 'Logs de Partidas', value: `${guildInfos.logs.roomLogs ? `${interaction.guild.channels.cache.get(guildInfos.logs.commandLogs)} (${guildInfos.logs.roomLogs})` : 'Não definido'}` }
                        ])
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configLogs')
                                .setPlaceholder('Selecione a ação que você deseja executar')
                                .setMinValues(1)
                                .setMaxValues(1)
                                .setDisabled(disabled)
                                .addOptions([
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
                                        label: 'Configurar | Logs de comandos',
                                        description: 'Clique aqui para setar o canal das logs de comandos.',
                                        value: 'setCommandLogs',
                                        emoji: '1008518050313670666'
                                    },
                                    {
                                        label: 'ㅤ',
                                        value: 'nullOption2',
                                    },
                                    {
                                        label: 'Configurar | Logs de partidas',
                                        description: 'Clique aqui para setar o canal das logs de partidas.',
                                        value: 'setRoomLogs',
                                        emoji: '986779763379154985'
                                    },
                                ]),
                        )
                ]
            })
        }

        await attMainMessage(interaction, false);

        const intMsg = await interaction.fetchReply()
        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id });
            await attMainMessage(interaction, false);

            switch (i.values[0]) {
                case 'homepage': {
                    if (i.replied != true) await i.deferUpdate()
                    const dashboardHomepage = require('../dashboard.js')

                    collector.stop('back to homepage')
                    dashboardHomepage.execute(client, interaction, args, true)
                    break;
                } // homePage

                case "setCommandLogs": {
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
                            { $set: { "logs.commandLogs": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O canal ${channelInfos} foi definido como o canal utilizado para logs de comandos.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // setCommandLogs

                case "setRoomLogs": {
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
                            { $set: { "logs.roomLogs": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O canal ${channelInfos} foi definido como o canal utilizado para logs de partida.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // setRoomLogs
            }
        })

    }
}