const Discord = require('discord.js')
module.exports = {
    rank: "premium",
    name: "adv",
    description: "Gerencie as advertências no servidor.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Dar advertência.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.User,
                    name: 'user',
                    description: 'Usuário que você deseja dar advertência.',
                    required: true
                },
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: 'motivo',
                    description: 'Motivo pelo qual o usuário está levando advertência.',
                    required: false
                },
            ]
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remover advertência.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.User,
                    name: 'user',
                    description: 'Usuário que você deseja remover advertência.',
                    required: true,
                },
            ]
        },
    ],
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

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            if (guildInfos && guildInfos.permissions.commandadv) {
                if (!interaction.member.roles.cache.find(role => guildInfos.permissions.commandadv.includes(role.id))) return interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription('Você não possui permissão.')
                            .setColor('#FF4040')
                    ]
                })
            } else {
                return interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription('Você não possui permissão.')
                            .setColor('#FF4040')
                    ]
                })
            }
        }

        let action = args[0].toLowerCase()
        let usuario = interaction.guild.members.cache.get(args[1])
        let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: usuario.id })
        let cargo;

        if (["add"].includes(action)) {
            let reason = interaction.args[1] ? interaction.args[1] : 'Sem motivo definido.'
            if (reason.length > 45) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`O motivo deve ter no máximo 45 caracteres.\n\`!adv ${action} <@membro>\``)
                        .setColor('#FF4040')
                ]
            })
            let timestamp = Date.now()

            await client.database.users.findOneAndUpdate(
                { guildID: interaction.guild.id, userID: usuario.id },
                { $push: { adv: { staff: interaction.user.id, timestamp: timestamp, reason: `${reason}` } } }
            )

            userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: usuario.id })

            const punishments = guildInfos.adv.punishments.sort((a, b) => a.goal - b.goal)
            const findMeta = punishments.find(punishment => punishment.goal == userInfos.adv.length)

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                        .setTitle(`Advertência aplicada!`)
                        .setDescription(`O usuário infringiu as regras do servidor e foi advertido por um staff!`)
                        .setThumbnail(usuario.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                        .addFields([
                            { name: 'Usuário', value: `${usuario} (${usuario.id})`, inline: true },
                            { name: 'Staff', value: `${interaction.user} (${interaction.user.id})`, inline: true },
                            { name: 'Motivo', value: `${reason}`, inline: true },
                        ])
                        .setColor('#4CFF40')
                        .setTimestamp()
                ]
            })

            if (guildInfos.adv && guildInfos.adv.channel) {
                if (client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel)) client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel).send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription(`> **ADVERTÊNCIA APLICADA!**\n**Usuário:** ${usuario} (${usuario.id})\n**Staff:** ${interaction.user} (${interaction.user.id})\n**Motivo:** ${reason}`)
                            .setColor('#FFB5C5')
                    ]
                })
            }

            if (findMeta) {
                switch (findMeta.punishment) {
                    case 'ban': {
                        if (guildInfos.adv && guildInfos.adv.channel) {
                            if (client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel)) client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel).send({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`Após ter chegado em ${findMeta.goal} advertências, o usuário ${usuario} (${usuario.id}) foi **banido**.`)
                                        .setColor('#ff3f3f')
                                ]
                            })
                        }

                        usuario.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                                    .setTitle(`VOCÊ FOI BANIDO!`)
                                    .setDescription(`Você atingiu **${findMeta.goal}** advertências e foi banido de **${interaction.guild.name}** pelo sistema de punições automático.\n\n*Caso desconfie que isso é um erro, tente entrar em contato com a administração do servidor.*`)
                                    .addFields([
                                        { name: `Informações da sua última advertência:`, value: `**Staff:** ${interaction.user} (${interaction.user.id});\n**Data:** <t:${Math.round(timestamp / 1000)}:F>;\n**Motivo:** ${reason};` }
                                    ])
                                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 2048 }))
                                    .setColor('#ff3f3f')
                                    .setTimestamp()
                                    .setFooter({ text: 'Ganty ©' })
                            ]
                        })
                        usuario.ban({ deleteMessageDays: 7, reason: `${interaction.user.tag} | via Ganty - ${reason}` })

                        break;
                    }
                    case 'kick': {
                        if (guildInfos.adv && guildInfos.adv.channel) {
                            if (client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel)) client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel).send({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`Após ter chegado em ${findMeta.goal} advertências, o usuário ${usuario} (${usuario.id}) foi **kickado**.`)
                                        .setColor('#ff3f3f')
                                ]
                            })
                        }

                        usuario.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                                    .setTitle(`VOCÊ FOI KICKADO!`)
                                    .setDescription(`Você atingiu **${findMeta.goal}** advertências e foi kickado de **${interaction.guild.name}** pelo sistema de punições automático.\n\n*Caso desconfie que isso é um erro, tente entrar em contato com a administração do servidor.*`)
                                    .addFields([
                                        { name: `Informações da sua última advertência:`, value: `**Staff:** ${interaction.user} (${interaction.user.id});\n**Data:** <t:${Math.round(timestamp / 1000)}:F>;\n**Motivo:** ${reason};` }
                                    ])
                                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 2048 }))
                                    .setColor('#ff3f3f')
                                    .setTimestamp()
                                    .setFooter({ text: 'Ganty ©' })
                            ]
                        })
                        usuario.kick(`${interaction.user.tag} | via Ganty - ${reason}`)

                        break;
                    }
                    case 'mute': {
                        if (guildInfos.adv && guildInfos.adv.channel) {
                            if (client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel)) client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel).send({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`Após ter chegado em ${findMeta.goal} advertências, o usuário ${usuario} (${usuario.id}) foi **mutado por ${client.convertTime(findMeta.time)}**.`)
                                        .setColor('#ff3f3f')
                                ]
                            })
                        }

                        usuario.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                                    .setTitle(`VOCÊ FOI MUTADO!`)
                                    .setDescription(`Você atingiu **${findMeta.goal}** advertências e foi mutado por ${client.convertTime(findMeta.time)} em **${interaction.guild.name}** pelo sistema de punições automático.\n\n*Caso desconfie que isso é um erro, tente entrar em contato com a administração do servidor.*`)
                                    .addFields([
                                        { name: `Informações da sua última advertência:`, value: `**Staff:** ${interaction.user} (${interaction.user.id});\n**Data:** <t:${Math.round(timestamp / 1000)}:F>;\n**Motivo:** ${reason};` }
                                    ])
                                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 2048 }))
                                    .setColor('#ff3f3f')
                                    .setTimestamp()
                                    .setFooter({ text: 'Ganty ©' })
                            ]
                        })

                        usuario.timeout(findMeta.time, `${interaction.user.tag} | via Ganty - ${reason}`)
                        break;
                    }
                    case 'clear': {
                        if (guildInfos.adv && guildInfos.adv.channel) {
                            if (client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel)) client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel).send({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`Após ter chegado em ${findMeta.goal} advertências, o usuário ${usuario} (${usuario.id}) **perdeu seus pontos**.`)
                                        .setColor('#ff3f3f')
                                ]
                            })
                        }

                        usuario.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                                    .setTitle(`VOCÊ PERDEU SEUS PONTOS!`)
                                    .setDescription(`Você atingiu **${findMeta.goal}** advertências e perdeu seus pontos em **${interaction.guild.name}** para o sistema de punições automático.\n\n*Caso desconfie que isso é um erro, tente entrar em contato com a administração do servidor.*`)
                                    .addFields([
                                        { name: `Informações da sua última advertência:`, value: `**Staff:** ${interaction.user} (${interaction.user.id});\n**Data:** <t:${Math.round(timestamp / 1000)}:F>;\n**Motivo:** ${reason};` }
                                    ])
                                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 2048 }))
                                    .setColor('#ff3f3f')
                                    .setTimestamp()
                                    .setFooter({ text: 'Ganty ©' })
                            ]
                        })

                        await client.database.users.findOneAndUpdate(
                            { guildID: interaction.guild.id, userID: usuario.id },
                            { $set: { points: 0 } },
                        )
                        break;
                    }
                }

                if (punishments[punishments.length - 1].goal == findMeta.goal) {
                    await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: usuario.id },
                        { $set: { adv: [] } }
                    )

                    if (guildInfos.adv && guildInfos.adv.channel) {
                        if (client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel)) client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel).send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O usuário ${usuario} (${usuario.id}) chegou no limite de advertências e teve suas advertências resetadas.`)
                                    .setColor('#ff3f3f')
                            ]
                        })
                    }
                }
            }
        }

        if (["remove"].includes(action)) {

            if (userInfos?.adv?.length <= 0) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('O usuário não possui nenhuma advertência.')
                        .setColor('#FF4040')
                ]
            })

            const msgC = await interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`${interaction.user}, abaixo você encontra as três últimas advertências do usuário, escolha qual você deseja remover.`)
                        .addFields([
                            { name: `Advertências`, value: `${userInfos.adv.sort((a, b) => a.timestamp - b.timestamp).map((adv, i) => `**${i + 1}.** <t:${Math.round(adv.timestamp / 1000)}:F>\n**Staff:** ${client.users.cache.get(adv.staff)} (${adv.staff})\n**Motivo:** ${adv.reason}`).join('\n\n')}` }
                        ])
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('actionsMenu')
                                .setPlaceholder('Selecione qual advertência você deseja remover.')
                                .setMaxValues(1)
                                .setMinValues(1)
                                .addOptions([].concat(userInfos.adv.sort((a, b) => a.timestamp - b.timestamp).map((adv, i) => {
                                    return { label: `Advertência ${i + 1}`, description: `Motivo: ${adv.reason}`, value: `${i}` }
                                })))
                        )
                ]
            })

            const filter = i => i.user.id == interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 20000, max: 1 });

            collector.on('collect', async i => {
                if (i.replied != true) await i.deferUpdate()

                const selectedAdv = userInfos.adv[i.values[0]]

                await client.database.users.findOneAndUpdate(
                    { guildID: interaction.guild.id, userID: usuario.id },
                    { $pull: { adv: selectedAdv } }
                )

                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                            .setTitle(`Advertência removida!`)
                            .setDescription(`Às vezes erros podem acontecer, e tá tudo bem!`)
                            .setThumbnail(usuario.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                            .addFields([
                                { name: `Usuário`, value: `${usuario} (${usuario.id})` },
                                { name: `Staff que removeu`, value: `${interaction.user} (${interaction.user.id})` },
                                { name: `Informações da Advertência`, value: `**Data:** <t:${Math.round(selectedAdv.timestamp / 1000)}:F>\n**Staff:** ${client.users.cache.get(selectedAdv.staff)} (${selectedAdv.staff})\n**Motivo:** ${selectedAdv.reason}` }
                            ])
                            .setColor('#4CFF40')
                            .setTimestamp()
                    ],
                    components: []
                })

                if (guildInfos.adv && guildInfos.adv.channel) {
                    if (client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel)) client.guilds.cache.get(guildInfos.guildID).channels.cache.get(guildInfos.adv.channel).send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`> **ADVERTÊNCIA REMOVIDA!**\n**Usuário:** ${usuario} (${usuario.id})\n**Staff:** ${interaction.user} (${interaction.user.id})`)
                                .setColor('#FFB5C5')
                        ]
                    })
                }
            })

            collector.on('end', async (collected, reason) => {
                if (reason == "time") { await attMainMessage(interaction, false); msgC.delete(); }
            })
        }
    }
}