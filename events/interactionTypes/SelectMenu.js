const Discord = require('discord.js');

module.exports = {
    async execute(client, interaction) {
        if (interaction.customId == 'select') {
            interaction.update({ fetchReply: true })
        }

        // FUNCTIONS DE FINALIZAÇÃO
        attUsers = async (array) => {
            let guildMembers = await client.database.users.find({ guildID: interaction.guild.id })
            const ordered = guildMembers.filter(user => user.points).sort((a, b) => b.points - a.points)

            array.forEach(async userID => {
                await client.sleep(1000)
                let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID })

                if (userInfos?.points) {
                    const membro = interaction.guild.members.cache.get(userID)
                    if (!membro) return;

                    const posicao = ordered.findIndex(item => item.userID == userID) + 1
                    if (membro?.roles.highest.position >= interaction.guild.members.me.roles.highest.position || interaction.guild.ownerId == membro.user.id) return;
                    membro.setNickname(`RANK ${posicao} | ${userInfos.nick ? userInfos.nick : membro.user.username.length > 20 ? membro.user.username.slice(membro.user.username.length / 2) : membro.user.username}`)

                    let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                    let ranks = guildInfos.ranks.sort((a, b) => a.points - b.points)

                    if ((userInfos.points) && (ranks && ranks.length > 1)) {
                        for (let i = 0; i < ranks.length; i++) {
                            if (i == 0 && userInfos.points >= ranks[i].points && userInfos.points < ranks[i + 1].points) {
                                ranks.forEach(async rank => {
                                    await client.sleep(1000)
                                    if (rank.rank != ranks[i].rank) {
                                        if (membro.roles.cache.has(rank.rank) && interaction.guild.roles.cache.get(rank.rank)) membro.roles.remove(rank.rank)
                                    }
                                })
                                if (!membro.roles.cache.has(ranks[i].rank) && interaction.guild.roles.cache.get(ranks[i].rank)) membro.roles.add(ranks[i].rank)
                            }

                            if (i > 0 && i < ranks.length - 1 && userInfos.points >= ranks[i].points && userInfos.points < ranks[i + 1].points) {
                                ranks.forEach(async rank => {
                                    await client.sleep(1000)
                                    if (rank.rank != ranks[i].rank) {
                                        if (membro.roles.cache.has(rank.rank) && interaction.guild.roles.cache.get(rank.rank)) membro.roles.remove(rank.rank)
                                    }
                                })
                                if (!membro.roles.cache.has(ranks[i].rank) && interaction.guild.roles.cache.get(ranks[i].rank)) membro.roles.add(ranks[i].rank)
                            }

                            if (i == ranks.length - 1 && userInfos.points >= ranks[i].points) {
                                ranks.forEach(async rank => {
                                    await client.sleep(1000)
                                    if (rank.rank != ranks[i].rank) {
                                        if (membro.roles.cache.has(rank.rank) && interaction.guild.roles.cache.get(rank.rank)) membro.roles.remove(rank.rank)
                                    }
                                })
                                if (!membro.roles.cache.has(ranks[i].rank) && interaction.guild.roles.cache.get(ranks[i].rank)) membro.roles.add(ranks[i].rank)
                            }
                        }
                        client.sleep(3500)
                    }
                }
            })
        }

        finishedRoom = async (interaction) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
            let partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel.id })
            if (partidaInfos) {
                guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setTitle('<:warning:935238904284594227> | Partida Finalizada!').setDescription(`A partida foi finalizada. Deletarei todos os canais em 10 segundos...`).setColor('#A52A2A')] })

                setTimeout(() => {
                    if (guildInfos.systems.activated && guildInfos.systems.activated.indexOf('ranks') != -1) attUsers(partidaInfos.groupOne.players)
                    if (guildInfos.systems.activated && guildInfos.systems.activated.indexOf('ranks') != -1) attUsers(partidaInfos.groupTwo.players)

                    partidaInfos.groupOne.players.forEach(async userID => {
                        await client.sleep(1000)
                        client.inQG = await client.inQG.filter(m => m != userID)
                        const membro = await interaction.guild.members.cache.get(userID)
                        let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID })
                        let channel = await interaction.guild.channels.cache.get(userInfos.callOld)

                        await client.database.users.findOneAndUpdate(
                            { userID: userID, guildID: interaction.guild.id },
                            { $set: { room: null } }
                        )
                        if (membro.voice.channelId) await interaction.guild.members.cache.get(userID).voice.setChannel(channel)
                        await client.database.users.findOneAndUpdate(
                            { userID: userID, guildID: interaction.guild.id },
                            { $set: { callOld: null } }
                        )
                    })

                    partidaInfos.groupTwo.players.forEach(async userID => {
                        await client.sleep(2000)
                        client.inQG = await client.inQG.filter(m => m != userID)
                        const membro = await interaction.guild.members.cache.get(userID)
                        let userInfos = await client.database.users.findOne({ guildID: interaction.guild?.id, userID: userID })
                        let channel = await interaction.guild.channels.cache.get(userInfos.callOld)

                        await client.database.users.findOneAndUpdate(
                            { userID: userID, guildID: interaction.guild.id },
                            { $set: { room: null } }
                        )
                        if (membro.voice.channelId) await interaction.guild.members.cache.get(userID).voice.setChannel(channel)
                        await client.database.users.findOneAndUpdate(
                            { userID: userID, guildID: interaction.guild.id },
                            { $set: { callOld: null } }
                        )
                    })
                }, 5000);

                setTimeout(async () => {
                    partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel?.id })

                    if (partidaInfos?.textChannel && interaction.guild.channels.cache.get(partidaInfos?.textChannel)) await interaction.guild.channels.cache.get(partidaInfos?.textChannel).delete()
                    if (partidaInfos?.groupOne.voiceChannel && interaction.guild.channels.cache.get(partidaInfos?.groupOne.voiceChannel)) await interaction.guild.channels.cache.get(partidaInfos?.groupOne.voiceChannel).delete()
                    if (partidaInfos?.groupTwo.voiceChannel && interaction.guild.channels.cache.get(partidaInfos?.groupTwo.voiceChannel)) await interaction.guild.channels.cache.get(partidaInfos?.groupTwo.voiceChannel).delete()
                    if (interaction.guild.channels.cache.get(partidaInfos?.generalVoiceChannel)) await interaction.guild.channels.cache.get(partidaInfos?.generalVoiceChannel).delete()

                    await client.database.partidas.findOneAndDelete({ textChannel: interaction.channelId })
                }, 20000);

                client.guilds.cache.get('972930558210478162').channels.cache.get('992075727207944304').send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor('#FF4040')
                            .setTitle(`LOG | Sala finalizada`)
                            .addFields([
                                { name: `Finalizada por`, value: `Votação iniciada por ${interaction.user} (${interaction.user.id})`, inline: true },
                                { name: `Servidor:`, value: `${interaction.guild.name} (${interaction.guild.id})` },
                                { name: `Número da Sala:`, value: `${partidaInfos.code}`, inline: true },
                            ])
                            .setFooter({ text: 'Horário' })
                            .setTimestamp()
                    ]
                })

                guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                if (guildInfos.premium.active && guildInfos.premium.type == "normal") {
                    const logChannel = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                    if (logChannel.logs.roomLogs) {
                        if (client.channels.cache.get(logChannel.logs.roomLogs)) client.channels.cache.get(logChannel.logs.roomLogs).send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setColor('#FF4040')
                                    .setTitle(`LOG | Sala finalizada`)
                                    .addFields([
                                        { name: `Finalizada por`, value: `Votação iniciada por ${interaction.user} (${interaction.user.id})`, inline: true },
                                        { name: `Servidor:`, value: `${interaction.guild.name} (${interaction.guild.id})` },
                                        { name: `Sala/ID`, value: `<#${partidaInfos.textChannel}> (${partidaInfos.textChannel})`, inline: true },
                                        { name: `Número da Sala:`, value: `${partidaInfos.code}`, inline: true },
                                    ])
                                    .setFooter({ text: 'Horário' })
                                    .setTimestamp()
                            ]
                        })
                    }
                }
            } else {
                interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setTitle('<:warning:935238904284594227> | Partida Finalizada!').setDescription(`A partida foi finalizada. Deletarei todos os canais em 10 segundos...`).setColor('#A52A2A')] })

                const code = interaction.channel.name.split('-')[1].toUpperCase()
                const channelsWithCode = interaction.guild.channels.cache.filter(channel => channel.name.includes(code))
                const channelsArray = channelsWithCode.map(c => c)

                const usersRoom = await client.database.users.find({ guildID: interaction.guild.id, room: code })

                usersRoom.forEach(async user => {
                    await client.sleep(1000)
                    await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: user.userID },
                        { $set: { room: null } }
                    )
                })

                channelsArray.forEach(async channel => {
                    await client.sleep(1000)
                    if (interaction.guild.channels.cache.get(channel.id)) interaction.guild.channels.cache.get(channel.id).delete()
                })
                interaction.channel.delete()
            }
        }

        // ACTIONS TO ROOMS
        switch (interaction.values[0]) {
            case 'closeroom': {
                const guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                if (interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) || interaction.member.roles.cache.find(role => guildInfos.permissions.managesystems.includes(role.id))) {
                    let partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel.id })
                    if ((guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (partidaInfos.haveMVP && partidaInfos.isWinnerDefined && !partidaInfos.isMVPDefined) return interaction.channel.send(`${interaction.member}, não é possível finalizar a partida sem definir o MVP.`)
                        if (partidaInfos.haveMVP && !partidaInfos.isWinnerDefined && partidaInfos.isMVPDefined) return interaction.channel.send(`${interaction.member}, não é possível finalizar a partida sem definir o vencedor.`)
                    }

                    return finishedRoom(interaction)
                } else {
                    let partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel.id })

                    if ((guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (partidaInfos.haveMVP && partidaInfos.isWinnerDefined && !partidaInfos.isMVPDefined) return interaction.channel.send(`${interaction.member}, não é possível finalizar a partida sem definir o MVP.`)
                        if (partidaInfos.haveMVP && !partidaInfos.isWinnerDefined && partidaInfos.isMVPDefined) return interaction.channel.send(`${interaction.member}, não é possível finalizar a partida sem definir o vencedor.`)
                    }

                    let msgE = await interaction.channel.send({ content: `${interaction.member}`, embeds: [new Discord.EmbedBuilder().setTitle('<a:gavel_gif:935241087587582002> | Confirmação de Finalização').setDescription('Clicando no botão, você encerrará a partida e os canais serão deletados.').setColor('#B9D3EE')], components: [new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder().setStyle(Discord.ButtonStyle.Success).setCustomId('confirmClose').setLabel(`Confirmar`).setEmoji('<:sim2sim:920817993250897960>').setDisabled(false))] })

                    const filter = i => i.user.id == partidaInfos.groupOne.players[0] || i.user.id == partidaInfos.groupTwo.players[0]
                    const collector = msgE.createMessageComponentCollector({ filter, time: 2 * 60000 })
                    let arrayC = []

                    collector.on('collect', async i => {
                        if (i.replied != true) await i.deferUpdate()

                        if (i.customId == 'confirmClose') {
                            if (arrayC.indexOf(i.member.id) != -1) return;

                            interaction.channel.send(`${i.member} confirmou!`)
                            arrayC.push(i.member.id)

                            if (arrayC.length == 2) {
                                collector.stop(["fim"])
                                await msgE.delete()
                                return finishedRoom(interaction)
                            }
                        }
                    })
                }
                break;
            }

            case 'reportWin': {
                const guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && !interaction.member.roles.cache.find(role => guildInfos.permissions.managesystems.includes(role.id))) {
                    let partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel.id })

                    if (partidaInfos.isWinnerDefined == true) return interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`${interaction.member}, o vencedor da partida já foi definido.`).setColor('#FF4040')] })

                    if (partidaInfos.groupOne.players && interaction.member == partidaInfos.groupOne.players[0]) {
                        let msgT = await interaction.channel.send({
                            embeds: [new Discord.EmbedBuilder()
                                .setTitle('<a:gold_medal_gif:935239544989691936> | Confirmação de Vencedor')
                                .setDescription('Clicando no botão, você confirma que o Time 1 venceu e receberá os pontos da partida.')
                                .setColor('#B9D3EE')
                            ], components: [new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                        .setStyle(Discord.ButtonStyle.Success)
                                        .setCustomId('confirmWin')
                                        .setLabel(`Confirmar`)
                                        .setEmoji('<:sim2sim:920817993250897960>')
                                        .setDisabled(false)
                                )
                            ]
                        })

                        const filter = i => i.user.id == partidaInfos.groupOne.players[0] || i.user.id == partidaInfos.groupTwo.players[0] || i.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) || (guildInfos.permissions.closeroom.length > 0 && !interaction.member.roles.cache.find(role => guildInfos.permissions.closeroom.includes(role.id)))
                        const collector = msgT.createMessageComponentCollector({ filter, time: 2 * 60000 })
                        let arrayC = []

                        collector.on('collect', async i => {
                            if (i.replied != true) await i.deferUpdate()

                            if (i.customId == 'confirmWin') {
                                if (arrayC.indexOf(i.member.id) != -1) return;

                                interaction.channel.send(`${i.member} confirmou!`)
                                arrayC.push(i.member.id)

                                if (arrayC.length == 2) {
                                    if (partidaInfos.isWinnerDefined == true) return interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`${interaction.member}, o vencedor da partida já foi definido.`).setColor('#FF4040')] })

                                    collector.stop(["fim"])
                                    await client.database.partidas.findOneAndUpdate(
                                        { textChannel: interaction.channel.id },
                                        { $set: { isWinnerDefined: true } }
                                    )
                                    msgT.delete()
                                    interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`<:balloons:935240332977770576> | **Time 1 definido como vencedor!**`).setColor('#43CD80')] })

                                    partidaInfos.groupOne.players.forEach(async userID => {
                                        await client.sleep(1000)

                                        let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID });

                                        let pointsW = (guildInfos.premium.active && guildInfos.premium.type == "normal") && userInfos.consecutive >= guildInfos.configs.points.consecutives ? guildInfos.configs.points.win * 2 : guildInfos.configs.points.win

                                        await client.database.users.findOneAndUpdate(
                                            { guildID: interaction.guild.id, userID: userID },
                                            { $inc: { points: pointsW, win: 1, consecutive: 1 } }
                                        )
                                    })

                                    partidaInfos.groupTwo.players.forEach(async userID => {
                                        await client.sleep(1000)

                                        let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID })
                                        let pointsL = userInfos.points > 0 ? guildInfos.configs.points.lose : 0;

                                        await client.database.users.findOneAndUpdate(
                                            { guildID: interaction.guild.id, userID: userID },
                                            { $inc: { points: -pointsL, lose: 1 }, $set: { consecutives: 0 } }
                                        )
                                    })

                                    if ((guildInfos.premium.active && guildInfos.premium.type == "normal") && guildInfos.logs.roomLogs) {
                                        if (client.channels.cache.get(guildInfos.logs.roomLogs)) client.channels.cache.get(guildInfos.logs.roomLogs).send({
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setColor('#4CFF40')
                                                    .setTitle(`LOG | Pontuação distribuída`)
                                                    .addFields([
                                                        { name: `Sala/ID`, value: `<#${partidaInfos.textChannel}> (${partidaInfos.textChannel})`, inline: true },
                                                        { name: `Solicitado por`, value: `Time 1`, inline: true },
                                                        { name: `Número da Sala:`, value: `${partidaInfos.code}`, inline: true }
                                                    ])
                                                    .setFooter({ text: 'Horário' })
                                                    .setTimestamp()
                                            ]
                                        })
                                    }
                                }
                            }
                        })
                    } else {
                        if (partidaInfos.groupTwo.players && interaction.member == partidaInfos.groupTwo.players[0]) {
                            let msgT = await interaction.channel.send({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setTitle('<a:gold_medal_gif:935239544989691936> | Confirmação de Vencedor')
                                        .setDescription('Clicando no botão, você confirma que o Time 2 venceu e receberá os pontos da partida.')
                                        .setColor('#B9D3EE')
                                ], components: [
                                    new Discord.ActionRowBuilder()
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                                .setStyle(Discord.ButtonStyle.Success)
                                                .setCustomId('confirmWin')
                                                .setLabel(`Confirmar`)
                                                .setEmoji('<:sim2sim:920817993250897960>')
                                                .setDisabled(false)
                                        )
                                ]
                            })

                            const filter = i => i.user.id == partidaInfos.groupOne.players[0] || i.user.id == partidaInfos.groupTwo.players[0]
                            const collector = msgT.createMessageComponentCollector({ filter, time: 2 * 60000 })
                            let arrayC = []

                            collector.on('collect', async i => {
                                if (i.replied != true) await i.deferUpdate()

                                if (i.customId == 'confirmWin') {
                                    if (arrayC.indexOf(i.member.id) != -1) return;

                                    interaction.channel.send(`${i.member} confirmou!`)
                                    arrayC.push(i.member.id)

                                    if (arrayC.length == 2) {
                                        if (partidaInfos.isWinnerDefined == true) return interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`${interaction.member}, o vencedor da partida já foi definido.`).setColor('#FF4040')] })

                                        collector.stop(["fim"])
                                        await client.database.partidas.findOneAndUpdate(
                                            { textChannel: interaction.channel.id },
                                            { $set: { isWinnerDefined: true } }
                                        )
                                        msgT.delete()
                                        interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`<:balloons:935240332977770576> | **Time 2 definido como vencedor!**`).setColor('#43CD80')] })

                                        partidaInfos.groupOne.players.forEach(async userID => {
                                            await client.sleep(1000)

                                            let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID })
                                            let pointsL = userInfos.points > 0 ? guildInfos.configs.points.lose : 0;

                                            await client.database.users.findOneAndUpdate(
                                                { guildID: interaction.guild.id, userID: userID },
                                                { $inc: { points: -pointsL, lose: 1 }, $set: { consecutives: 0 } }
                                            )
                                        })

                                        partidaInfos.groupTwo.players.forEach(async userID => {
                                            await client.sleep(1000)

                                            let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID });
                                            let pointsW = (guildInfos.premium.active && guildInfos.premium.type == "normal") && userInfos.consecutive >= guildInfos.configs.points.consecutives ? guildInfos.configs.points.win * 2 : guildInfos.configs.points.win;

                                            await client.database.users.findOneAndUpdate(
                                                { guildID: interaction.guild.id, userID: userID },
                                                { $inc: { points: pointsW, win: 1, consecutive: 1 } }
                                            )
                                        })

                                        if ((guildInfos.premium.active && guildInfos.premium.type == "normal") && guildInfos.logs.roomLogs) {
                                            if (client.channels.cache.get(guildInfos.logs.roomLogs)) client.channels.cache.get(guildInfos.logs.roomLogs).send({
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setColor('#4CFF40')
                                                        .setTitle(`LOG | Pontuação distribuída`)
                                                        .addFields([
                                                            { name: `Sala/ID`, value: `<#${partidaInfos.textChannel}> (${partidaInfos.textChannel})`, inline: true },
                                                            { name: `Solicitado por`, value: `Time 2`, inline: true },
                                                            { name: `Número da Sala:`, value: `${partidaInfos.code}`, inline: true }
                                                        ])
                                                        .setFooter({ text: 'Horário' })
                                                        .setTimestamp()
                                                ]
                                            })
                                        }
                                    }
                                }
                            })
                        }
                    }
                } else {
                    await interaction.channel.send({
                        content: `${interaction.member}`, embeds: [new Discord.EmbedBuilder().setTitle('Defina o Time Vencedor!').setDescription('Use o menu abaixo para definir o time vencedor da partida.').setColor('#FFB6C1')], components: [new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder().setCustomId('selectWinner').setPlaceholder('Selecione o vencedor da partida.').setMinValues(1).setMaxValues(1).addOptions(
                            {
                                label: 'Time 1',
                                description: `Clique aqui para definir que o time 1 venceu.`,
                                value: `team1`,
                            },
                            {
                                label: 'Time 2',
                                description: `Clique aqui para definir que o time 2 venceu.`,
                                value: `team2`,
                            },
                        ))]
                    })
                }
                break;
            }

            case 'team1': {
                await interaction.deferUpdate()

                const guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && !interaction.member.roles.cache.find(role => guildInfos.permissions.managesystems.includes(role.id))) return;
                let partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel.id })

                if (interaction.message) interaction.message.delete()

                if (partidaInfos.isWinnerDefined == true) return interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`${interaction.member}, o vencedor da partida já foi definido.`).setColor('#FF4040')] })

                await client.database.partidas.findOneAndUpdate(
                    { textChannel: interaction.channel.id },
                    { $set: { isWinnerDefined: true } }
                )
                interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`<:balloons:935240332977770576> | **Time 1 definido como vencedor!**`).setColor('#43CD80')] })

                partidaInfos.groupOne.players.forEach(async userID => {
                    await client.sleep(1000)

                    let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID });
                    let pointsW = (guildInfos.premium.active && guildInfos.premium.type == "normal") && userInfos.consecutive >= guildInfos.configs.points.consecutives ? guildInfos.configs.points.win * 2 : guildInfos.configs.points.win;

                    await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: userID },
                        { $inc: { points: pointsW, win: 1, consecutive: 1 } }
                    )
                })

                partidaInfos.groupTwo.players.forEach(async userID => {
                    await client.sleep(1000)

                    let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID })
                    let pointsL = userInfos.points > 0 ? guildInfos.configs.points.lose : 0;

                    await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: userID },
                        { $inc: { points: -pointsL, lose: 1 }, $set: { consecutives: 0 } }
                    )
                })

                if ((guildInfos.premium.active && guildInfos.premium.type == "normal") && guildInfos.logs.roomLogs) {
                    if (client.channels.cache.get(guildInfos.logs.roomLogs)) client.channels.cache.get(guildInfos.logs.roomLogs).send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor('#4CFF40')
                                .setTitle(`LOG | Pontuação distribuída`)
                                .addFields([
                                    { name: `Sala/ID`, value: `<#${partidaInfos.textChannel}> (${partidaInfos.textChannel})`, inline: true },
                                    { name: `Solicitado por`, value: `Time 1`, inline: true },
                                    { name: `Time definido`, value: `Time 1`, inline: true },
                                    { name: `Número da Sala:`, value: `${partidaInfos.code}`, inline: true }
                                ])
                                .setFooter({ text: 'Horário' })
                                .setTimestamp()
                        ]
                    })
                }
                break;
            }

            case 'team2': {
                await interaction.deferUpdate()

                const guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && !interaction.member.roles.cache.find(role => guildInfos.permissions.managesystems.includes(role.id))) return;

                let partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel.id })

                if (interaction.message) interaction.message.delete()

                if (partidaInfos.isWinnerDefined == true) return interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`${interaction.member}, o vencedor da partida já foi definido.`).setColor('#FF4040')] })

                await client.database.partidas.findOneAndUpdate(
                    { textChannel: interaction.channel.id },
                    { $set: { isWinnerDefined: true } }
                )
                interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`<:balloons:935240332977770576> | **Time 2 definido como vencedor!**`).setColor('#43CD80')] })

                partidaInfos.groupOne.players.forEach(async userID => {
                    await client.sleep(1000)

                    let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID })
                    let pointsL = userInfos.points > 0 ? guildInfos.configs.points.lose : 0;

                    await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: userID },
                        { $inc: { points: -pointsL, lose: 1 }, $set: { consecutives: 0 } }
                    )
                })

                partidaInfos.groupTwo.players.forEach(async userID => {
                    await client.sleep(1000)

                    let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: userID });
                    let pointsW = (guildInfos.premium.active && guildInfos.premium.type == "normal") && userInfos.consecutive >= guildInfos.configs.points.consecutives ? guildInfos.configs.points.win * 2 : guildInfos.configs.points.win;

                    await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: userID },
                        { $inc: { points: pointsW, win: 1, consecutive: 1 } }
                    )
                })

                if ((guildInfos.premium.active && guildInfos.premium.type == "normal") && guildInfos.logs.roomLogs) {
                    if (client.channels.cache.get(guildInfos.logs.roomLogs)) client.channels.cache.get(guildInfos.logs.roomLogs).send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor('#4CFF40')
                                .setTitle(`LOG | Pontuação distribuída`)
                                .addFields([
                                    { name: `Sala/ID`, value: `<#${partidaInfos.textChannel}> (${partidaInfos.textChannel})`, inline: true },
                                    { name: `Solicitado por`, value: `Time 2`, inline: true },
                                    { name: `Time definido`, value: `Time 2`, inline: true },
                                    { name: `Número da Sala:`, value: `${partidaInfos.code}`, inline: true }
                                ])
                                .setFooter({ text: 'Horário' })
                                .setTimestamp()
                        ]
                    })
                }
                break;
            }

            case 'setMVP': {
                const guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && !interaction.member.roles.cache.find(role => guildInfos.permissions.managesystems.includes(role.id))) {
                    let partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel.id })

                    if (partidaInfos.isMVPDefined == true) return interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`${interaction.member}, o MVP da partida já foi definido.`).setColor('#FF4040')] })

                    let membersForMVP = []

                    partidaInfos.groupOne.players.forEach(player => {
                        let memberInfo = interaction.guild.members.cache.get(player)

                        membersForMVP.push(
                            {
                                label: `Time 1: ${memberInfo?.nickname ? memberInfo?.nickname : memberInfo?.user.username}`,
                                description: `ID: ${player}`,
                                value: player
                            }
                        )
                    })

                    partidaInfos.groupTwo.players.forEach(player => {
                        let memberInfo = interaction.guild.members.cache.get(player)

                        membersForMVP.push(
                            {
                                label: `Time 2: ${memberInfo?.nickname ? memberInfo?.nickname : memberInfo?.user.username}`,
                                description: `ID: ${player}`,
                                value: player
                            }
                        )
                    })

                    let msg = await interaction.channel.send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription('No menu abaixo, selecione o jogador que foi MVP.')
                                .setColor('#4876FF')
                        ], components: [
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.StringSelectMenuBuilder()
                                    .setCustomId('defineMVP')
                                    .setPlaceholder('Selecione o membro que foi MVP.')
                                    .setMinValues(1)
                                    .setMaxValues(1)
                                    .addOptions(membersForMVP)
                            )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = msg.createMessageComponentCollector({ filter, time: 20000, max: 1 });

                    collector.on('collect', async m => {
                        let selectedUser = interaction.guild.members.cache.get(m.values[0])

                        let msgC = await interaction.channel.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setTitle('<:bang:935240316661923850> | Confirmação de MVP')
                                    .setDescription(`Clicando no botão, você confirma que ${selectedUser} foi o MVP e receberá os pontos de MVP.`)
                                    .setColor('#B9D3EE')
                            ],
                            components: [
                                new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.ButtonBuilder()
                                            .setStyle(Discord.ButtonStyle.Success)
                                            .setCustomId('confirmMVP')
                                            .setLabel(`Confirmar`)
                                            .setEmoji('<:sim2sim:920817993250897960>')
                                            .setDisabled(false)
                                    )
                            ]
                        })

                        const filter = i => i.user.id == partidaInfos.groupOne.players[0] || i.user.id == partidaInfos.groupTwo.players[0]
                        const collector = msgC.createMessageComponentCollector({ filter, time: 1 * 60000 })

                        let arrayC = [];

                        msg.delete()

                        collector.on('collect', async i => {
                            if (i.customId == 'confirmMVP') {
                                if (i.replied != true) await i.deferUpdate()
                                if (arrayC.indexOf(i.member.id) != -1) return;

                                interaction.channel.send(`O capitão ${i.user} confirmou.`)
                                arrayC.push(i.user.id)

                                if (arrayC.length == 2) {
                                    await collector.stop(["fim"])
                                    await client.database.partidas.findOneAndUpdate(
                                        { textChannel: interaction.channel.id },
                                        { $set: { isMVPDefined: true } }
                                    )
                                    msgC.delete()
                                    interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`<:bang:935240316661923850> | ${selectedUser} definido como MVP!`).setColor('#43CD80')] })
                                    await client.database.users.findOneAndUpdate(
                                        { guildID: interaction.guild.id, userID: selectedUser.id },
                                        { $inc: { points: guildInfos.configs.points.mvp, mvp: 1 } }
                                    )

                                    if ((guildInfos.premium.active && guildInfos.premium.type == "normal") && guildInfos.logs.roomLogs) {
                                        if (client.channels.cache.get(guildInfos.logs.roomLogs)) client.channels.cache.get(guildInfos.logs.roomLogs).send({
                                            embeds: [
                                                new Discord.EmbedBuilder()
                                                    .setColor('#4CFF40')
                                                    .setTitle(`LOG | MVP Setado`)
                                                    .addFields([
                                                        { name: `Setado por`, value: `${interaction.user} (${interaction.user.id})`, inline: true },
                                                        { name: `Usuário setado`, value: `${selectedUser} (${selectedUser.id})`, inline: true },
                                                        { name: `Sala/ID`, value: `<#${partidaInfos.textChannel}> (${partidaInfos.textChannel})`, inline: true },
                                                        { name: `Número da Sala`, value: `${partidaInfos.code}`, inline: true }
                                                    ])
                                                    .setFooter({ text: 'Horário' })
                                                    .setTimestamp()
                                            ]
                                        })
                                    }
                                }
                            }
                        })
                    })
                } else {
                    let partidaInfos = await client.database.partidas.findOne({ textChannel: interaction.channel.id })

                    let membersForMVP = []

                    partidaInfos.groupOne.players.forEach(player => {
                        let memberInfo = interaction.guild.members.cache.get(player)

                        membersForMVP.push(
                            {
                                label: `Time 1: ${memberInfo?.nickname ? memberInfo?.nickname : memberInfo?.user?.username}`,
                                value: player
                            }
                        )
                    })

                    partidaInfos.groupTwo.players.forEach(player => {
                        let memberInfo = interaction.guild.members.cache.get(player)

                        membersForMVP.push(
                            {
                                label: `Time 2: ${memberInfo?.nickname ? memberInfo?.nickname : memberInfo?.user?.username}`,
                                value: player
                            }
                        )
                    })

                    let msg = await interaction.channel.send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription('No menu abaixo, selecione o jogador que foi MVP.')
                                .setColor('#4876FF')
                        ], components: [
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.StringSelectMenuBuilder()
                                    .setCustomId('defineMVP')
                                    .setPlaceholder('Selecione o membro que foi MVP.')
                                    .setMinValues(1)
                                    .setMaxValues(1)
                                    .addOptions(membersForMVP)
                            )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = msg.channel.createMessageComponentCollector({ filter, time: 20000, max: 1 });

                    collector.on('collect', async m => {
                        let selectedUser = interaction.guild.members.cache.get(m.values[0])

                        msg.delete()

                        await client.database.partidas.findOneAndUpdate(
                            { textChannel: interaction.channel.id },
                            { $set: { isMVPDefined: true } }
                        )
                        await client.database.users.findOneAndUpdate(
                            { guildID: interaction.guild.id, userID: m.values[0] },
                            { $inc: { points: guildInfos.configs.points.mvp, mvp: 1 } }
                        )
                        interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setDescription(`<:bang:935240316661923850> | ${selectedUser.user} definido como MVP!`).setColor('#43CD80')] })

                        if ((guildInfos.premium.active && guildInfos.premium.type == "normal") && guildInfos.logs.roomLogs) {
                            if (client.channels.cache.get(guildInfos.logs.roomLogs)) client.channels.cache.get(guildInfos.logs.roomLogs).send({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setColor('#4CFF40')
                                        .setTitle(`LOG | MVP Setado`)
                                        .addFields([
                                            { name: `Setado por`, value: `${interaction.user} (${interaction.user.id})`, inline: true },
                                            { name: `Usuário setado`, value: `${selectedUser.user} (${selectedUser.user.id})`, inline: true },
                                            { name: `Sala/ID`, value: `<#${partidaInfos.textChannel}> (${partidaInfos.textChannel})`, inline: true },
                                            { name: `Número da Sala`, value: `${partidaInfos.code}`, inline: true }
                                        ])
                                        .setFooter({ text: 'Horário' })
                                        .setTimestamp()
                                ]
                            })
                        }
                    })
                }
                break;
            }
        }
    }
}