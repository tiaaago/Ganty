const Discord = require('discord.js');
module.exports = {
    name: 'Advertência',
    description: 'Gerencie o sistema de advertências do seu servidor.',
    emoji: '991445757922119771',
    value: 'adv',
    premiumConfig: true,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Advertências")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de gerenciamento de advertências, aqui você pode - sem muita dificuldade - gerenciar o canal de advertências e setar os cargos que serão usados para marcar as advertências dos usuários.\n\nCaso queira alterar algo, basta utilizar os botões ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields([
                            { name: `Canal de Advertências`, value: `${guildInfos.adv.channel ? `<#${guildInfos.adv.channel}>` : 'Não definido'}` },
                            { name: `Metas`, value: `${guildInfos.adv.punishments.length ? guildInfos.adv.punishments.sort((a, b) => a.goal - b.goal).map(punishment => `**${punishment.goal} advertência(s)**: ação ${punishment.punishment};`).join('\n') : 'Não definido'}` },
                        ])
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configAdv')
                                .setPlaceholder('Selecione a ação que você deseja executar.')
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
                                        label: 'Configurar | Canal de advertências',
                                        description: 'Clique aqui para setar um novo canal de advertências.',
                                        emoji: '991445528837636157',
                                        value: 'setAdvChannel',
                                    },
                                    {
                                        label: 'ㅤ',
                                        value: 'nullOption2',
                                    },
                                    {
                                        label: 'Adicionar | Meta de advertências',
                                        description: 'Clique aqui para configurar uma nova meta de advertências.',
                                        emoji: '991445757922119771',
                                        value: 'addGoal'
                                    },
                                    {
                                        label: 'Remover | Meta de advertências',
                                        description: 'Clique aqui para remover uma meta de advertências existente.',
                                        emoji: '991445757922119771',
                                        value: 'removeGoal'
                                    },
                                ]),
                        ),
                ]
            })
        }

        await attMainMessage(interaction, false);

        const intMsg = await interaction.fetchReply()
        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            await attMainMessage(interaction, false);

            switch (i.values[0]) {
                case 'homepage': {
                    if (i.replied != true) await i.deferUpdate()
                    const dashboardHomepage = require('../dashboard.js')

                    collector.stop('back to homepage')
                    dashboardHomepage.execute(client, interaction, args, true)
                    break;
                }

                case 'setAdvChannel': {
                    await i.deferReply()
                    
                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, o canal que você deseja setar.`,
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
                    const collector = selectMessage.createMessageComponentCollector({ filter, time: 30000 })

                    collector.on('collect', async int => {
                        selectMessage.delete()
                        
                        const channel = interaction.guild.channels.cache.get(int.values[0])

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "adv.channel": channel.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O canal ${channel} foi definido como o canal de advertências.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    })
                    break;
                }
                case 'removeGoal': {
                    if (i.replied != true) await i.deferUpdate()

                    let msgC = await interaction.channel.send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`${i.member}, selecione no menu abaixo a meta que você deseja excluir.`)
                                .setColor('#18191c')
                        ],
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.StringSelectMenuBuilder()
                                        .setCustomId('configAdv')
                                        .setPlaceholder('Selecione a ação que você deseja executar.')
                                        .setMinValues(1)
                                        .setMaxValues(1)
                                        .addOptions([].concat(guildInfos.adv.punishments.map(punishment => {
                                            return { label: `${punishment.goal} advertência(s) | ${punishment.punishment[0].toUpperCase() + punishment.punishment.substring(1)}`, value: `${punishment.goal}` }
                                        }))),
                                ),
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = msgC.channel.createMessageComponentCollector({ filter, time: 20000, max: 1 });

                    collector.on('collect', async i => {
                        const punishment = guildInfos.adv.punishments.find(punishment => punishment.goal == i.values[0])
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $pull: { "adv.punishments": punishment } }
                        )

                        msgC.delete();
                        await attMainMessage(interaction, false);

                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`A meta **${punishment.goal} advertência(s) - ${punishment.punishment[0].toUpperCase() + punishment.punishment.substring(1)}** foi excluída com sucesso.`)
                                    .setColor('#32CD32')
                            ]
                        })
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msgC.delete(); }
                    })
                    break;
                }
                case 'addGoal': {
                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('addGoalModal')
                            .setTitle('Dashboard | Advertências')
                            .addComponents(
                                new Discord.ActionRowBuilder().addComponents(
                                    new Discord.TextInputBuilder()
                                        .setCustomId('goalNumberInput')
                                        .setLabel("Meta de Advertências:")
                                        .setPlaceholder("Digite aqui uma meta de advertências para que uma ação seja executada. Ex: 1, 5, 10.")
                                        .setStyle(Discord.TextInputStyle.Short)
                                        .setRequired(true)
                                ),
                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;

                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let numberGoals = res.fields.getTextInputValue('goalNumberInput');

                            if (isNaN(numberGoals)) return interaction.followUp({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('A meta informada precisa ser um número.')
                                        .setColor('#FF4040')
                                ]
                            })

                            if (numberGoals < 1) return interaction.followUp({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('A meta informada precisa ser maior do que 0.')
                                        .setColor('#FF4040')
                                ]
                            })


                            if (guildInfos.adv.punishments.find(punishment => punishment.goal == numberGoals)) return interaction.followUp({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('A meta informada já possui uma punição configurada.')
                                        .setColor('#FF4040')
                                ]
                            })

                            await attMainMessage(interaction, true);

                            const actionMsg = await interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`${res.member}, selecione a ação que você deseja que o BOT execute ao atingir essa meta.`)
                                        .setColor('#6C7B8B')
                                ],
                                components: [
                                    new Discord.ActionRowBuilder()
                                        .addComponents(
                                            new Discord.StringSelectMenuBuilder()
                                                .setCustomId('actionsMenu')
                                                .setPlaceholder('Selecione a ação que você deseja que o BOT execute.')
                                                .setMaxValues(1)
                                                .setMinValues(1)
                                                .addOptions([
                                                    {
                                                        label: 'Banir',
                                                        description: 'Essa ação fará com que o usuário seja banido ao atingir a meta.',
                                                        value: 'ban'
                                                    },
                                                    {
                                                        label: 'Expulsar',
                                                        description: 'Essa ação fará com que o usuário seja expulso do servidor ao atingir a meta.',
                                                        value: 'kick'
                                                    },
                                                    {
                                                        label: 'Mutar',
                                                        description: 'Essa ação fará com que o usuário seja mutado ao atingir a meta.',
                                                        value: 'mute'
                                                    },
                                                    {
                                                        label: 'Limpar pontos',
                                                        description: 'Essa ação fará com que o usuário perca seus pontos ao atingir a meta.',
                                                        value: 'clear'
                                                    },
                                                ])
                                        )
                                ]
                            })

                            const filter = i => i.user.id == interaction.user.id;
                            const coletor = actionMsg.channel.createMessageComponentCollector({ filter, time: 20000, max: 1 });

                            coletor.on('collect', async i => {
                                actionMsg.delete();
                                const action = i.values[0]

                                if (action == "ban") {
                                    await client.database.guilds.findOneAndUpdate(
                                        { guildID: interaction.guild.id },
                                        {
                                            $push: {
                                                "adv.punishments": {
                                                    goal: numberGoals,
                                                    punishment: action
                                                }
                                            }
                                        }
                                    )

                                    interaction.followUp({
                                        ephemeral: true,
                                        embeds: [
                                            new Discord.EmbedBuilder()
                                                .setDescription(`**Você definiu uma nova meta:**\n\nAo chegar em **${numberGoals}** advertência(s) o usuário será **banido**.`)
                                                .setColor('#32CD32')
                                        ]
                                    })

                                    await attMainMessage(interaction, false);
                                } else if (action == "kick") {
                                    await client.database.guilds.findOneAndUpdate(
                                        { guildID: interaction.guild.id },
                                        {
                                            $push: {
                                                "adv.punishments": {
                                                    goal: numberGoals,
                                                    punishment: action
                                                }
                                            }
                                        }
                                    )

                                    interaction.followUp({
                                        ephemeral: true,
                                        embeds: [
                                            new Discord.EmbedBuilder()
                                                .setDescription(`**Você definiu uma nova meta:**\n\nAo chegar em **${numberGoals}** advertência(s) o usuário será **kickado**.`)
                                                .setColor('#32CD32')
                                        ]
                                    })

                                    await attMainMessage(interaction, false);
                                } else if (action == "clear") {
                                    await client.database.guilds.findOneAndUpdate(
                                        { guildID: interaction.guild.id },
                                        {
                                            $push: {
                                                "adv.punishments": {
                                                    goal: numberGoals,
                                                    punishment: action
                                                }
                                            }
                                        }
                                    )

                                    interaction.followUp({
                                        ephemeral: true,
                                        embeds: [
                                            new Discord.EmbedBuilder()
                                                .setDescription(`**Você definiu uma nova meta:**\n\nAo chegar em **${numberGoals}** advertência(s) o usuário **perderá seus pontos**.`)
                                                .setColor('#32CD32')
                                        ]
                                    })

                                    await attMainMessage(interaction, false);
                                } else if (action == "mute") {
                                    await i.showModal(
                                        new Discord.ModalBuilder()
                                            .setCustomId('setMuteTimeModal')
                                            .setTitle('Dashboard | Advertências')
                                            .addComponents(
                                                new Discord.ActionRowBuilder()
                                                    .addComponents(
                                                        new Discord.TextInputBuilder()
                                                            .setCustomId('timeMuteInput')
                                                            .setLabel("Tempo de mute:")
                                                            .setPlaceholder("Digite aqui o tempo que você deseja mutar o membro. Exemplo: 1d, 5m, 30s. O tempo máximo é de 20d.")
                                                            .setStyle(Discord.TextInputStyle.Paragraph)
                                                            .setRequired(true)
                                                    ),

                                            )
                                    );

                                    const filter = i => i.user.id == interaction.user.id;

                                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                                        .then(async res => {
                                            if (res.replied != true) await res.deferUpdate()

                                            const timeString = res.fields.getTextInputValue('timeMuteInput');
                                            const convertedTime = client.convertTime(timeString);
                                            const timeNumber = timeString.split("").filter(n => (Number(n) || n == 0)).join("");

                                            await attMainMessage(interaction, false);

                                            if (!timeString.includes('s') && !timeString.includes('m') && !timeString.includes('h') && !timeString.includes('d')) return interaction.followUp({
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setDescription('O tempo informado não é válido.')
                                                        .setColor('#FF4040')
                                                ]
                                            })

                                            if (!timeNumber) return interaction.followUp({
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setDescription('O tempo informado não é válido.')
                                                        .setColor('#FF4040')
                                                ]
                                            })

                                            if (convertedTime < 1) return interaction.followUp({
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setDescription('O tempo informado precisa ser maior que 0.')
                                                        .setColor('#FF4040')
                                                ]
                                            })

                                            if (timeNumber > 20 && timeString.includes('d')) return interaction.followUp({
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setDescription('O tempo informado não pode passar de 20 dias.')
                                                        .setColor('#FF4040')
                                                ]
                                            })

                                            await client.database.guilds.findOneAndUpdate(
                                                { guildID: interaction.guild.id },
                                                {
                                                    $push: {
                                                        "adv.punishments": {
                                                            goal: numberGoals,
                                                            punishment: action,
                                                            time: convertedTime
                                                        }
                                                    }
                                                }
                                            )

                                            await attMainMessage(interaction, false);

                                            interaction.followUp({
                                                ephemeral: true,
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setDescription(`**Você definiu uma nova meta:**\n\nAo chegar em **${quantityMsg}** advertência(s) o usuário será **mutado** por **${timeString}**.`)
                                                        .setColor('#32CD32')
                                                ]
                                            })
                                        })
                                        .catch(async (err) => {
                                            if (err.message.includes('time')) {
                                                await attMainMessage(interaction, false);
                                            }
                                        })
                                }
                            })
                        })
                        .catch(async (err) => {
                            if (err.message.includes('time')) {
                                await attMainMessage(interaction, false);
                            }
                        })
                    break;
                }
            }
        })
    }
}