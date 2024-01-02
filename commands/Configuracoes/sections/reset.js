const Discord = require('discord.js')
module.exports = {
    name: 'Reset',
    description: 'Resete as configurações do Ganty em seu servidor.',
    emoji: '935238839193202729',
    value: 'reset',
    premiumConfig: false,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            let optionsArray = [
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
                    label: 'Configuração | Canais e Categoria',
                    description: 'Clique aqui para resetar os canais e categoria configurados.',
                    value: 'resetCCategory',
                    emoji: '935240803251552326'
                },
                {
                    label: 'Configuração | Permissões',
                    description: 'Clique aqui para resetar as permissões configuradas.',
                    value: 'resetCPermissions',
                    emoji: '935240803251552326'
                },
                {
                    label: 'Configuração | Ranks',
                    description: 'Clique aqui para resetar os ranks configurados.',
                    value: 'resetCRanks',
                    emoji: '935240803251552326'
                },
                {
                    label: 'Configuração | Tudo',
                    description: 'Clique aqui para resetar tudo que estiver configurado.',
                    value: 'resetCAll',
                    emoji: '935240803251552326'
                },
                {
                    label: 'ㅤ',
                    value: 'nullOption2',
                },
                {
                    label: 'Membro | Tudo',
                    description: 'Clique aqui para resetar tudo de um membro ou de todos.',
                    value: 'resetMAll',
                    emoji: '993549608527597598'
                },
                {
                    label: 'Membro | Pontos',
                    description: 'Clique aqui para resetar pontos de um membro ou de todos.',
                    value: 'resetMPoints',
                    emoji: '993549608527597598'
                },
            ]

            if (guildInfos && guildInfos.premium.active && guildInfos.premium.type == 'normal') {
                optionsArray.push(
                    {
                        label: 'Membro | Vitórias',
                        description: 'Clique aqui para resetar vitórias de um membro ou de todos.',
                        value: 'resetMWin',
                        emoji: '993549608527597598'
                    },
                    {
                        label: 'Membro | Derrotas',
                        description: 'Clique aqui para resetar derrotas de um membro ou de todos.',
                        value: 'resetMLose',
                        emoji: '993549608527597598'
                    },
                    {
                        label: 'Membro | MVPs',
                        description: 'Clique aqui para resetar MVPs de um membro ou de todos.',
                        value: 'resetMMVP',
                        emoji: '993549608527597598'
                    }
                )
            }

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Reset")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de reset, aqui você pode - sem muita dificuldade - resetar as configurações do Ganty neste servidor ou pontos, vitórias, derrotas e MVPs de membros.\n\nCaso queira resetar algo, basta utilizar o menu ao final desta caixa (embed).")
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ], components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configReset')
                                .setPlaceholder('Selecione a ação que você deseja executar')
                                .setMinValues(1)
                                .setMaxValues(1)
                                .setDisabled(disabled)
                                .addOptions(optionsArray),
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

                case 'resetCCategory': {
                    if (i.replied != true) await i.deferUpdate()

                    await attMainMessage(interaction, true);
                    let msg = await interaction.followUp({
                        content: `${i.member}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor('#E6E6FA')
                                .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar a categoria e canais configurados? Tenha em mente que esta ação é irreversível.`)
                                .setFooter({ text: 'Caso não queira, não reaja.' })
                        ], components: [
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.ButtonBuilder()
                                    .setLabel('Confirmar')
                                    .setEmoji('948628833169457213')
                                    .setCustomId('confirm')
                                    .setStyle(Discord.ButtonStyle.Success)
                            )
                        ]
                    })

                    const filtro = user => user.id === interaction.user.id;
                    const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                    collector.on('collect', async i => {
                        if (i.customId === "confirm") {
                            if (i.member.id == client.user.id) return;
                            msg.delete()

                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { "$set": { "configs.commandChannels": [], "configs.filasChannels": [], "configs.voiceChannels": [], "configs.category": null } }
                            )

                            await attMainMessage(interaction, false);
                            await interaction.followUp({
                                content: `${i.member}`,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`${i.member}, todas as configurações de categoria e canais foram resetadas!`)
                                        .setColor('#32CD32')
                                ]
                            })
                        }
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetCCategory

                case 'resetCPermissions': {
                    if (i.replied != true) await i.deferUpdate()

                    await attMainMessage(interaction, true);
                    let msg = await interaction.followUp({
                        content: `${i.member}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar todas as permissões configuradas? Tenha em mente que esta ação é irreversível.`)
                                .setFooter({ text: 'Caso não queira, não reaja.' })
                                .setColor('#E6E6FA')
                        ], components: [
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.ButtonBuilder()
                                    .setLabel('Confirmar')
                                    .setEmoji('948628833169457213')
                                    .setCustomId('confirm')
                                    .setStyle(Discord.ButtonStyle.Success)
                            )
                        ]
                    })

                    const filtro = user => user.id === interaction.user.id;
                    const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                    collector.on('collect', async i => {
                        if (i.customId === "confirm") {
                            if (i.member.id == client.user.id) return;
                            msg.delete()

                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { "$set": { 'permissions.anychatcommand': [], 'permissions.closefila': [], 'permissions.closeroom': [], 'permissions.commandaddremovepoints': [], 'permissions.commandadv': [], 'permissions.commandconfig': [], 'permissions.commandgerarcoderemassinatura': [], 'permissions.commandsetupranked': [], 'permissions.managesystems': [], 'permissions.seeroomschannel': [] } }
                            )

                            await attMainMessage(interaction, false);
                            await interaction.followUp({
                                content: `${i.member}`,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`${i.member}, todas as configurações de permissões foram resetadas!`)
                                        .setColor('#32CD32')
                                ]
                            })
                        }
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetCPermissions

                case 'resetCRanks': {
                    if (i.replied != true) await i.deferUpdate()

                    await attMainMessage(interaction, true);
                    let msg = await interaction.followUp({
                        content: `${i.member}`,
                        embeds: [new Discord.EmbedBuilder()
                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar todos os ranks configurados? Tenha em mente que esta ação é irreversível.`)
                            .setFooter({ text: 'Caso não queira, não reaja.' })
                            .setColor('#E6E6FA')
                        ], components: [
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.ButtonBuilder()
                                    .setLabel('Confirmar')
                                    .setEmoji('948628833169457213')
                                    .setCustomId('confirm')
                                    .setStyle(Discord.ButtonStyle.Success)
                            )
                        ]
                    })

                    const filtro = user => user.id === interaction.user.id;
                    const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                    collector.on('collect', async i => {
                        if (i.customId === "confirm") {
                            if (i.member.id == client.user.id) return;
                            msg.delete()

                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { "$set": { "ranks": [] } }
                            )

                            await attMainMessage(interaction, false);
                            await interaction.followUp({
                                content: `${i.member}`,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`${i.member}, todas as configurações de ranks foram resetadas!`)
                                        .setColor('#32CD32')
                                ]
                            })
                        }
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetCRanks

                case 'resetCAll': {
                    if (i.replied != true) await i.deferUpdate()

                    await attMainMessage(interaction, true);
                    let msg = await interaction.followUp({
                        content: `${i.member}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor('#E6E6FA')
                                .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar todas as configurações? Tenha em mente que esta ação é irreversível.`)
                                .setFooter({ text: 'Caso não queira, não reaja.' })
                        ], components: [
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.ButtonBuilder()
                                    .setLabel('Confirmar')
                                    .setEmoji('948628833169457213')
                                    .setCustomId('confirm')
                                    .setStyle(Discord.ButtonStyle.Success)
                            )
                        ]
                    })

                    const filtro = user => user.id === interaction.user.id;
                    const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                    collector.on('collect', async i => {
                        if (i.customId === "confirm") {
                            if (i.replied != true) await i.deferUpdate()
                            if (i.member.id == client.user.id) return;
                            msg.delete()

                            await client.database.guilds.findOneAndDelete({ guildID: interaction.guild.id })
                            await client.database.guilds.create({ guildID: interaction.guild.id, premium: { active: guildInfos.premium.active ? guildInfos.premium.active : null, type: guildInfos.premium.type ? guildInfos.premium.type : null, finalTime: guildInfos.premium.finalTime ? guildInfos.premium.finalTime : null, lastBuyTime: guildInfos.premium.lastBuyTime ? guildInfos.premium.lastBuyTime : null, paymentId: guildInfos.premium.paymentId ? guildInfos.premium.paymentId : null } })
                        }

                        await attMainMessage(interaction, false);
                        await interaction.followUp({
                            content: `${i.member}`,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`${i.member}, todas as configurações de categoria e canais foram resetados!`)
                                    .setColor('#32CD32')
                            ]
                        })
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetCAll

                case 'resetMAll': {
                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('resetMemberModal')
                            .setTitle('Dashboard | Reset de Membro')
                            .addComponents(
                                new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.TextInputBuilder()
                                            .setCustomId('memberIDInput')
                                            .setLabel("ID do membro:")
                                            .setPlaceholder("Digite aqui o ID do membro. Para resetar todos, utilize ALL")
                                            .setStyle(Discord.TextInputStyle.Short)
                                    ),

                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;
                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let memberID = res.fields.getTextInputValue('memberIDInput').toLowerCase();

                            if (memberID == 'all') {
                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar tudo de todos os membros? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ],
                                    components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.user.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.updateMany(
                                            { guildID: interaction.guild.id },
                                            { "$set": { "points": 0, "lose": 0, "win": 0, "mvp": 0, "consecutives": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`Todos os membros tiveram **TUDO** resetado!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            } else {
                                let memberInfos = interaction.guild.members.cache.get(memberID)

                                if (!memberInfos) return interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription('O ID inserido não é de nenhum membro deste servidor.')
                                            .setColor('#FF4040')
                                    ]
                                })

                                await attMainMessage(interaction, true);

                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar tudo de ${memberInfos}? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ], components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.member.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.findOneAndUpdate(
                                            { guildID: interaction.guild.id, userID: memberInfos.user.id },
                                            { "$set": { "points": 0, "lose": 0, "win": 0, "mvp": 0, "consecutives": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`${memberInfos} teve **TUDO** resetado!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            }
                        })
                        .catch(async (err) => {
                            if (err.message.includes('time')) {
                                await attMainMessage(interaction, false);
                            }
                        })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetMAll

                case 'resetMPoints': {
                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('resetMemberModal')
                            .setTitle('Dashboard | Reset de Membro')
                            .addComponents(
                                new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.TextInputBuilder()
                                            .setCustomId('memberIDInput')
                                            .setLabel("ID do membro:")
                                            .setPlaceholder("Digite aqui o ID do membro. Para resetar todos, utilize ALL")
                                            .setStyle(Discord.TextInputStyle.Short)
                                    ),

                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;
                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let memberID = res.fields.getTextInputValue('memberIDInput').toLowerCase();

                            if (memberID == 'all') {
                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar os pontos de todos os membros? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ],
                                    components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.user.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.updateMany(
                                            { guildID: interaction.guild.id },
                                            { "$set": { "points": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`Todos os membros tiveram os **PONTOS** resetados!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            } else {
                                let memberInfos = interaction.guild.members.cache.get(memberID)

                                if (!memberInfos) return interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription('O ID inserido não é de nenhum membro deste servidor.')
                                            .setColor('#FF4040')
                                    ]
                                })

                                await attMainMessage(interaction, true);

                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar os pontos de ${memberInfos}? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ], components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.member.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.findOneAndUpdate(
                                            { guildID: interaction.guild.id, userID: memberInfos.user.id },
                                            { "$set": { "points": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`${memberInfos} teve os **PONTOS** resetados!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            }
                        })
                        .catch(async (err) => {
                            if (err.message.includes('time')) {
                                await attMainMessage(interaction, false);
                            }
                        })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetMPoints

                case 'resetMWin': {
                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('resetMemberModal')
                            .setTitle('Dashboard | Reset de Membro')
                            .addComponents(
                                new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.TextInputBuilder()
                                            .setCustomId('memberIDInput')
                                            .setLabel("ID do membro:")
                                            .setPlaceholder("Digite aqui o ID do membro. Para resetar todos, utilize ALL")
                                            .setStyle(Discord.TextInputStyle.Short)
                                    ),

                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;
                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let memberID = res.fields.getTextInputValue('memberIDInput').toLowerCase();

                            if (memberID == 'all') {
                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar as vitórias de todos os membros? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ],
                                    components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.user.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.updateMany(
                                            { guildID: interaction.guild.id },
                                            { "$set": { "win": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`Todos os membros tiveram as **VITÓRIAS** resetadas!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            } else {
                                let memberInfos = interaction.guild.members.cache.get(memberID)

                                if (!memberInfos) return interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription('O ID inserido não é de nenhum membro deste servidor.')
                                            .setColor('#FF4040')
                                    ]
                                })

                                await attMainMessage(interaction, true);

                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar as vitórias de ${memberInfos}? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ], components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.member.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.findOneAndUpdate(
                                            { guildID: interaction.guild.id, userID: memberInfos.user.id },
                                            { "$set": { "win": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`${memberInfos} teve as **VITÓRIAS** resetadas!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            }
                        })
                        .catch(async (err) => {
                            if (err.message.includes('time')) {
                                await attMainMessage(interaction, false);
                            }
                        })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetMWin

                case 'resetMLose': {
                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('resetMemberModal')
                            .setTitle('Dashboard | Reset de Membro')
                            .addComponents(
                                new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.TextInputBuilder()
                                            .setCustomId('memberIDInput')
                                            .setLabel("ID do membro:")
                                            .setPlaceholder("Digite aqui o ID do membro. Para resetar todos, utilize ALL")
                                            .setStyle(Discord.TextInputStyle.Short)
                                    ),

                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;
                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let memberID = res.fields.getTextInputValue('memberIDInput').toLowerCase();

                            if (memberID == 'all') {
                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar as derrotas de todos os membros? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ],
                                    components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.user.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.updateMany(
                                            { guildID: interaction.guild.id },
                                            { "$set": { "lose": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`Todos os membros tiveram as **DERROTAS** resetadas!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            } else {
                                let memberInfos = interaction.guild.members.cache.get(memberID)

                                if (!memberInfos) return interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription('O ID inserido não é de nenhum membro deste servidor.')
                                            .setColor('#FF4040')
                                    ]
                                })

                                await attMainMessage(interaction, true);

                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar as derrotas de ${memberInfos}? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ], components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.member.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.findOneAndUpdate(
                                            { guildID: interaction.guild.id, userID: memberInfos.user.id },
                                            { "$set": { "lose": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`${memberInfos} teve as **DERROTAS** resetadas!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            }
                        })
                        .catch(async (err) => {
                            if (err.message.includes('time')) {
                                await attMainMessage(interaction, false);
                            }
                        })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetMLose

                case 'resetMMVP': {
                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('resetMemberModal')
                            .setTitle('Dashboard | Reset de Membro')
                            .addComponents(
                                new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.TextInputBuilder()
                                            .setCustomId('memberIDInput')
                                            .setLabel("ID do membro:")
                                            .setPlaceholder("Digite aqui o ID do membro. Para resetar todos, utilize ALL")
                                            .setStyle(Discord.TextInputStyle.Short)
                                    ),

                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;
                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let memberID = res.fields.getTextInputValue('memberIDInput').toLowerCase();

                            if (memberID == 'all') {
                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar os MVPs de todos os membros? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ],
                                    components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.user.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.updateMany(
                                            { guildID: interaction.guild.id },
                                            { "$set": { "mvp": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`Todos os membros tiveram os **MVPs** resetados!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            } else {
                                let memberInfos = interaction.guild.members.cache.get(memberID)

                                if (!memberInfos) return interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription('O ID inserido não é de nenhum membro deste servidor.')
                                            .setColor('#FF4040')
                                    ]
                                })

                                await attMainMessage(interaction, true);

                                let msg = await interaction.followUp({
                                    content: `${res.member}`,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar os MVPs de ${memberInfos}? Tenha em mente que esta ação é irreversível.`)
                                            .setFooter({ text: 'Caso não queira, não utilize o botão.' })
                                            .setColor('#E6E6FA')
                                    ], components: [
                                        new Discord.ActionRowBuilder().addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel('Confirmar')
                                                .setEmoji('948628833169457213')
                                                .setCustomId('confirm')
                                                .setStyle(Discord.ButtonStyle.Success)
                                        )
                                    ]
                                })

                                const filtro = user => user.id === interaction.user.id;
                                const collector = msg.createMessageComponentCollector(filtro, { time: 60000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "confirm") {
                                        if (i.member.id == client.user.id) return;
                                        msg.delete()

                                        await client.database.users.findOneAndUpdate(
                                            { guildID: interaction.guild.id, userID: memberInfos.user.id },
                                            { "$set": { "mvp": 0 } }
                                        )

                                        await attMainMessage(interaction, false);

                                        await interaction.followUp({
                                            content: `${i.member}`,
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setDescription(`${memberInfos} teve os **MVPs** resetados!`)
                                                    .setColor('#32CD32')
                                            ]
                                        })
                                    }
                                })
                            }
                        })
                        .catch(async (err) => {
                            if (err.message.includes('time')) {
                                await attMainMessage(interaction, false);
                            }
                        })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msg.delete(); }
                    })
                    break;
                } // resetMMVP
            }
        })
    }
}