const Discord = require('discord.js')
module.exports = {
    name: 'Canais e Categoria',
    description: 'Gerencie a categoria de partidas, canais de comandos, filas e voz.',
    emoji: '991443155884965898',
    value: 'channels',
    premiumConfig: false,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Canais")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de gerenciamento de canais, aqui você pode - sem muita dificuldade - gerenciar a categoria de partidas, canais de comandos, filas e voz.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields([
                            { name: 'Categoria', value: `${guildInfos.configs.category ? `${interaction.guild.channels.cache.get(guildInfos.configs.category).name} (${guildInfos.configs.category})` : 'Não definida'}` },
                            { name: 'Canais de Comandos', value: `${guildInfos.configs.commandChannels.length >= 1 ? `${guildInfos.configs.commandChannels.map(c => ` ${interaction.guild.channels.cache.get(c)} (${c})`)}` : 'Não definido'}` },
                            { name: 'Canais de Filas', value: `${guildInfos.configs.filasChannels.length >= 1 ? `${guildInfos.configs.filasChannels.map(c => ` ${interaction.guild.channels.cache.get(c)} (${c})`)}` : 'Não definido'}` },
                            { name: 'Canais de Voz', value: `${guildInfos.configs.voiceChannels.length >= 1 ? `${guildInfos.configs.voiceChannels.map(c => ` ${interaction.guild.channels.cache.get(c)} (${c})`)}` : 'Não definido'}` }
                        ])
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configChannels')
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
                                        label: 'Adicionar | Canal de comandos',
                                        description: 'Clique aqui para adicionar um canal de comandos.',
                                        value: 'addCommandChannel',
                                        emoji: '991443155884965898'
                                    },
                                    {
                                        label: 'Remover | Canal de comandos',
                                        description: 'Clique aqui para retirar um canal de comandos.',
                                        value: 'remCommandChannel',
                                        emoji: '991443155884965898'
                                    },
                                    {
                                        label: 'ㅤ',
                                        value: 'nullOption2',
                                    },
                                    {
                                        label: 'Adicionar | Canal de filas',
                                        description: 'Clique aqui para adicionar um canal de filas.',
                                        value: 'addQueueChannel',
                                        emoji: '991443295848898670'
                                    },
                                    {
                                        label: 'Remover | Canal de filas',
                                        description: 'Clique aqui para retirar um canal de filas.',
                                        value: 'remQueueChannel',
                                        emoji: '991443295848898670'
                                    },
                                    {
                                        label: 'ㅤ',
                                        value: 'nullOption3',
                                    },
                                    {
                                        label: 'Adicionar | Canal de voz',
                                        description: 'Clique aqui para adicionar um canal de voz.',
                                        value: 'addVoiceChannel',
                                        emoji: '991443309388111922'
                                    },
                                    {
                                        label: 'Remover | Canal de voz',
                                        description: 'Clique aqui para retirar um canal de voz.',
                                        value: 'remVoiceChannel',
                                        emoji: '991443309388111922'
                                    },
                                    {
                                        label: 'ㅤ',
                                        value: 'nullOption4',
                                    },
                                    {
                                        label: 'Definir | Categoria de partidas',
                                        description: 'Clique aqui para definir a categoria de partidas.',
                                        value: 'setRoomCategory',
                                        emoji: '1008768172859592796'
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

                case "addCommandChannel": {
                    await i.deferReply();

                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos.configs.commandChannels.length >= 1) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de comandos. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos.configs.commandChannels.length >= 5) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de comandos.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

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

                        if (guildInfos && guildInfos.configs.commandChannels.indexOf(channelInfos.id) != -1) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este canal já está adicionado.')
                                    .setColor('#FF4040')
                            ]
                        })

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $push: { "configs.commandChannels": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O canal ${channelInfos} foi definido como um canal de comandos.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    })
                    break;
                } // addCommandChannel

                case "remCommandChannel": {
                    if (i.replied != true) await i.deferUpdate()
                    await attMainMessage(interaction, false);

                    if (guildInfos && !guildInfos.configs.commandChannels || guildInfos && guildInfos.configs.commandChannels.length <= 0) return interaction.followUp({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription('Não possui nenhum canal de comandos adicionado.')
                                .setColor('#FF4040')
                        ]
                    })

                    await attMainMessage(interaction, false);

                    let remChannelMenu = [];

                    if (guildInfos && guildInfos.configs.commandChannels) guildInfos.configs.commandChannels.forEach(channelID => {
                        remChannelMenu.push({
                            label: interaction.guild.channels.cache.get(channelID) ? interaction.guild.channels.cache.get(channelID).name : 'Canal deletado',
                            description: `ID: ${channelID}`,
                            value: `${channelID}`,
                            emoji: '<:trash:1008518050313670666>'
                        })
                    })

                    let msgC = await interaction.channel.send({
                        content: `${i.member}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`No menu abaixo, você encontrará a lista de canais de comandos que estão adicionados até o momento. Selecione todos que deseja remover.`)
                                .setColor('#6C7B8B')
                        ],
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.StringSelectMenuBuilder()
                                        .setCustomId('menuRemCommandChannel')
                                        .setPlaceholder('Selecione os canais de comandos que você deseja retirar')
                                        .setMinValues(1)
                                        .setMaxValues(remChannelMenu.length)
                                        .addOptions(remChannelMenu)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = msgC.createMessageComponentCollector({ filter, time: 2 * 60000, max: 1 })

                    collector.on('collect', async i => {
                        i.values.forEach(async value => {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $pull: { "configs.commandChannels": value } }
                            )
                        })

                        await client.sleep(1000)
                        await attMainMessage(interaction, false);

                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(i.values.length > 1 ? `Os canais com ID a seguir foram retirados dos canais de comandos:\n*${i.values.join('\n')}*` : `O canal com ID: *${i.values}* foi retirado dos canais de comandos.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        msgC.delete()
                        await attMainMessage(interaction, false);
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msgC.delete(); }
                    })
                    break;
                } // remCommandChannel

                case "addQueueChannel": {
                    await i.deferReply();

                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos.configs.filasChannels.length >= 1) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos.configs.filasChannels.length >= 5) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

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

                        if (guildInfos && guildInfos.configs.filasChannels.indexOf(channelInfos.id) != -1) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este canal já está adicionado.')
                                    .setColor('#FF4040')
                            ]
                        })

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $push: { "configs.filasChannels": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O canal ${channelInfos} foi definido como um canal de filas.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // addQueueChannel

                case "remQueueChannel": {
                    if (i.replied != true) await i.deferUpdate()
                    await attMainMessage(interaction, false);

                    if (guildInfos && !guildInfos.configs.filasChannels || guildInfos && guildInfos.configs.filasChannels.length <= 0) return interaction.followUp({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription('Não possui nenhum canal de filas adicionado.')
                                .setColor('#FF4040')
                        ]
                    })

                    await attMainMessage(interaction, false);

                    let remChannelMenu = []

                    if (guildInfos && guildInfos.configs.filasChannels) guildInfos.configs.filasChannels.forEach(channelID => {
                        remChannelMenu.push({
                            label: interaction.guild.channels.cache.get(channelID) ? interaction.guild.channels.cache.get(channelID).name : 'Canal deletado',
                            description: `ID: ${channelID}`,
                            value: `${channelID}`,
                            emoji: '<:trash:1008518050313670666>'
                        })
                    })

                    let msgC = await interaction.channel.send({
                        content: `${i.member}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`No menu abaixo, você encontrará a lista de canais de filas que estão adicionados até o momento. Selecione todos que deseja remover.`)
                                .setColor('#6C7B8B')
                        ],
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.StringSelectMenuBuilder()
                                        .setCustomId('menuRemCommandChannel')
                                        .setPlaceholder('Selecione os canais de filas que você deseja retirar')
                                        .setMinValues(1)
                                        .setMaxValues(remChannelMenu.length)
                                        .addOptions(remChannelMenu)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = msgC.createMessageComponentCollector({ filter, time: 5000 })

                    collector.on('collect', async i => {
                        i.values.forEach(async value => {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $pull: { "configs.filasChannels": value } }
                            )
                        })

                        await client.sleep(1000)
                        await attMainMessage(interaction, false)

                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(i.values.length > 1 ? `Os canais com ID a seguir foram retirados dos canais de filas:\n*${i.values.join('\n')}*` : `O canal com ID: *${i.values}* foi retirado dos canais de filas.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        msgC.delete()
                        await attMainMessage(interaction, false);
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msgC.delete(); }
                    })
                    break;
                } // remQueueChannel

                case "addVoiceChannel": {
                    await attMainMessage(interaction, false);
                    await i.deferReply();

                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos.configs.voiceChannels.length >= 2) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de voz. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos.configs.voiceChannels.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de voz.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, o canal que você deseja adicionar.`,
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ChannelSelectMenuBuilder()
                                        .setChannelTypes(Discord.ChannelType.GuildVoice)
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

                        if (guildInfos && guildInfos.configs.voiceChannels.indexOf(channelInfos.id) != -1) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este canal já está adicionado.')
                                    .setColor('#FF4040')
                            ]
                        })

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $push: { "configs.voiceChannels": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O canal ${channelInfos} foi definido como um canal de voz.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // addVoiceChannel

                case "remVoiceChannel": {
                    if (i.replied != true) await i.deferUpdate()
                    await attMainMessage(interaction, false);

                    if (guildInfos && !guildInfos.configs.voiceChannels || guildInfos && guildInfos.configs.voiceChannels.length <= 0) return interaction.followUp({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription('Não possui nenhum canal de voz adicionado.')
                                .setColor('#FF4040')
                        ]
                    })

                    await attMainMessage(interaction, false);

                    let remChannelMenu = [];

                    if (guildInfos && guildInfos.configs.voiceChannels) guildInfos.configs.voiceChannels.forEach(channelID => {
                        remChannelMenu.push({
                            label: interaction.guild.channels.cache.get(channelID) ? interaction.guild.channels.cache.get(channelID).name : 'Canal deletado',
                            description: `ID: ${channelID}`,
                            value: `${channelID}`,
                            emoji: '<:trash:1008518050313670666>'
                        })
                    })

                    let msgC = await interaction.channel.send({
                        content: `${i.member}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`No menu abaixo, você encontrará a lista de canais de voz que estão adicionados até o momento. Selecione todos que deseja remover.`)
                                .setColor('#6C7B8B')
                        ],
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.StringSelectMenuBuilder()
                                        .setCustomId('menuRemCommandChannel')
                                        .setPlaceholder('Selecione os canais de voz que você deseja retirar')
                                        .setMinValues(1)
                                        .setMaxValues(remChannelMenu.length)
                                        .addOptions(remChannelMenu)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = msgC.createMessageComponentCollector({ filter, time: 5000 })

                    collector.on('collect', async i => {
                        i.values.forEach(async value => {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $pull: { "configs.voiceChannels": value } }
                            )
                        })

                        await client.sleep(1000)
                        await attMainMessage(interaction, false)

                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(i.values.length > 1 ? `Os canais com ID a seguir foram retirados dos canais de voz:\n*${i.values.join('\n')}*` : `O canal com ID: *${i.values}* foi retirado dos canais de voz.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        msgC.delete()
                        await attMainMessage(interaction, false);
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msgC.delete(); }
                    })
                    break;
                } // remVoiceChannel

                case "setRoomCategory": {
                    await i.deferReply();

                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, a categoria que você deseja setar.`,
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
                            { $set: { "configs.category": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`A categoria **${channelInfos.name}** foi definida como a categoria de partidas.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    });
                    break;
                } // setRoomCategory
            }
        })
    }
}