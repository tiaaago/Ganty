const Discord = require('discord.js')
const { generate } = require('generate-password')
module.exports = {
    rank: "everyone",
    name: "criarfila",
    description: 'Inicie uma fila.',
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: '1v1',
            description: 'Criar uma partida na modalidade 1v1.'
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: '2v2',
            description: 'Criar uma partida na modalidade 2v2.'
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: '3v3',
            description: 'Criar uma partida na modalidade 3v3.'
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: '4v4',
            description: 'Criar uma partida na modalidade 4v4.'
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: '5v5',
            description: 'Criar uma partida na modalidade 5v5.'
        }

    ],
    async execute(client, interaction, args) {
        let modalidade = args[0].toLowerCase()

        let authorInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: interaction.user.id })
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        if (guildInfos.configs.filasChannels.length > 0 && !guildInfos.configs.filasChannels.includes(interaction.channel.id)) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`${interaction.user}, este canal não é um canal de filas.`)
                    .setColor('#FF4040')
            ]
        })

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && !interaction.member.voice.channelId) {
            return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`${interaction.user}, você não está em um canal de voz.`)
                        .setColor('#FF4040')
                ]
            })
        } else if (guildInfos.configs.voiceChannels.length > 0 && !guildInfos.configs.voiceChannels.includes(interaction.member.voice.channelId)) {
            return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`${interaction.user}, você não está em nenhum canal de voz setado.`)
                        .setColor('#FF4040')
                ]
            })
        }

        if (client.inQG.filter(m => m == interaction.user.id).length >= 1) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`${interaction.user}, você já está em uma fila.`)
                    .setColor('#FF4040')
            ]
        })

        if (authorInfos && authorInfos.room) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`${interaction.user}, você já está em uma partida.`)
                    .setColor('#FF4040')
            ]
        })

        let entradas = []; let numberP; let disab = false;

        if (modalidade == '1v1') {
            if (guildInfos && !guildInfos.configs.filasState.v1) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Este formato de fila está fechado.')
                        .setColor('#FF4040')
                ]
            })
            numberP = 2
        }

        if (modalidade == '2v2') {
            if (guildInfos && !guildInfos.configs.filasState.v2) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Este formato de fila está fechado.')
                        .setColor('#FF4040')
                ]
            })
            numberP = 4
        }

        if (modalidade == '3v3') {
            if (guildInfos && !guildInfos.configs.filasState.v3) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Este formato de fila está fechado.')
                        .setColor('#FF4040')
                ]
            })
            numberP = 6
        }

        if (modalidade == '4v4') {
            if (guildInfos && !guildInfos.configs.filasState.v4) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Este formato de fila está fechado.')
                        .setColor('#FF4040')
                ]
            })
            numberP = 8
        }

        if (modalidade == '5v5') {
            if (guildInfos && !guildInfos.configs.filasState.v5) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Este formato de fila está fechado.')
                        .setColor('#FF4040')
                ]
            })
            numberP = 10
        }

        if (!guildInfos.premium.active && guildInfos.dailyRooms >= 5) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('Este servidor já atingiu o limite de partidas diárias. Retire o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                    .setColor('#FF4040')
            ]
        })

        if ((guildInfos.premium.active && guildInfos.premium.type == "booster") && guildInfos.premium.dailyRooms >= 15) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('Este servidor já atingiu o limite de partidas diárias. Retire o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                    .setColor('#FF4040')
            ]
        })

        const entradasString = () => {
            let entradasSt = []

            for (var i = 1; i < numberP + 1; i++) {
                const userInfosForQueue = client.users.cache.get(entradas[i - 1])
                entradasSt.push(`${userInfosForQueue ? `<:traffic_red:936343568782598214> ${userInfosForQueue}` : '<:traffic_green:936343569227210802> **LIVRE**'}`)
            }
            return entradasSt
        }

        async function msgAtt(mensagem) {
            let entradasArray = entradasString()

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setCustomId('joinFila')
                    .setLabel(`Entrar na Fila [${entradas.length}/${numberP}]`)
                    .setEmoji('<:tick_sim:922279560911941662>')
                    .setDisabled(disab),

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId('closeFila')
                    .setLabel('Encerrar Fila')
                    .setEmoji('<:tick_neutro:922279577089376277>')
                    .setDisabled(disab),

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId('quitFila')
                    .setLabel('Sair da Fila')
                    .setEmoji('<:tick_nao:922279597201031189>')
                    .setDisabled(disab),
            )

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle(`<a:fire_gif:935241064699269141> | Fila ${args[0]}!`)
                        .setDescription(`Abaixo, você confere os participantes da partida. Lembre-se que a distribuição de times é automática e a separação abaixo não possui nenhuma relevância com o time que será formado após o início da partida. Bom jogo!`)
                        .addFields([
                            { name: 'Participantes', value: `${entradasArray.length < 1 ? "<:traffic_green:936343569227210802> **LIVRE**" : entradasArray.splice(0, numberP / 2).join('\n')}`, inline: true },
                            { name: 'Participantes', value: `${entradasArray.length < 1 ? "<:traffic_green:936343569227210802> **LIVRE**" : entradasArray.join('\n')}`, inline: true },
                        ])
                        .setColor('#90EE90')
                ], components: [row]
            })
        }

        const msg = await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Aguarde um pouquinho...`)
                    .setColor('#5F9EA0')
            ]
        })

        await client.inQG.push(interaction.user.id)
        await entradas.push(interaction.user.id)

        await msgAtt(msg)

        const filter = i => i.user.id != client.user.id
        const collector = msg.createMessageComponentCollector({ filter, time: 10 * 60000 })

        collector.on('collect', async i => {
            await i.deferUpdate()

            switch (i.customId) {
                case 'joinFila': {
                    if (!interaction.guild.members.cache.get(i.user.id)) return i.followUp({
                        ephemeral: true,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`${i.user}, utilize um comando meu para conseguir entrar em filas.`)
                                .setColor('#FF4040')
                        ]
                    })

                    guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                    userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: i.user.id })

                    if (!userInfos) return i.followUp({
                        ephemeral: true,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`${i.user}, utilize um comando meu para conseguir entrar em filas.`)
                                .setColor('#FF4040')
                        ]
                    })

                    var pesquisa = entradas.indexOf(i.user.id);
                    if (pesquisa != -1) return i.followUp({
                        ephemeral: true,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`${i.user}, você já está nesta fila.`)
                                .setColor('#FF4040')
                        ]
                    })

                    var pesquisa = client.inQG.indexOf(i.user.id);
                    if (pesquisa != -1) return i.followUp({
                        ephemeral: true,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`${i.user}, você já está em uma fila.`)
                                .setColor('#FF4040')
                        ]
                    })

                    userInRoom = await client.database.users.findOne({ guildID: interaction.guild.id, userID: i.user.id })
                    if (userInRoom.room) return i.followUp({
                        ephemeral: true,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`${i.user}, você já está em uma partida.`)
                                .setColor('#FF4040')
                        ]
                    })

                    if (!i.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && !i.member.voice.channelId) {
                        return i.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`${i.user}, você não está em um canal de voz.`)
                                    .setColor('#FF4040')
                            ]
                        })
                    } else if (guildInfos.configs.voiceChannels.length > 0 && !guildInfos.configs.voiceChannels.includes(i.member.voice.channelId)) {
                        return i.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`${i.user}, você não está em nenhum canal de voz setado.`)
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    client.inQG.push(i.user.id)
                    entradas.push(i.user.id)

                    msgAtt(msg)
                    break;
                }

                case 'closeFila': {
                    guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

                    if (i.user.id != interaction.user.id) {
                        if (!i.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
                            if (guildInfos.permissions.managesystems) {
                                if (!i.member.roles.cache.find(role => guildInfos.permissions.managesystems.includes(role.id))) return;
                            } else {
                                return;
                            }
                        }
                    }

                    disab = true;
                    msgAtt(msg)

                    await client.sleep(2000)
                    entradas.forEach(async user => {
                        await client.sleep(1000)
                        client.inQG = client.inQG.filter(userID => userID != user)
                    })

                    await interaction.followUp({
                        content: `${i.user}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`Fila encerrada com sucesso!`)
                                .setColor('#FF4040')
                        ]
                    })
                    break;
                }

                case 'quitFila': {
                    guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

                    var pesquisa = entradas.indexOf(i.user.id)
                    if (pesquisa == -1) return i.followUp({
                        ephemeral: true,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`${i.user}, você não está nesta fila.`)
                                .setColor('#FF4040')
                        ]
                    })

                    client.inQG = client.inQG.filter(userID => userID != i.user.id)
                    entradas = entradas.filter(v => v != i.user.id)

                    msgAtt(msg)
                    break;
                }
            }

            if (entradas.length == numberP) {
                disab = true;
                msgAtt(msg)

                await client.sleep(1000)

                entradas.forEach(async user => {
                    await client.sleep(1000)
                    client.inQG = await client.inQG.filter(userID => userID != user)
                })

                entradas = entradas.splice(0, numberP)
                entradas = shuffle(entradas)

                await collector.stop(['start'])

                await interaction.followUp({ embeds: [new Discord.EmbedBuilder().setDescription(`Fila lotada! Aguarde um pouco, estou criando os canais...`).setColor('#E0FFFF')] }).then(msg => setTimeout(() => msg.delete(), 5000))
            }
        })

        collector.on("end", async (collected, reason) => {
            if (reason == "time") {
                entradas.forEach(async user => {
                    await client.sleep(1000)
                    client.inQG = await client.inQG.filter(userID => userID != user)
                })

                disab = true;
                msgAtt(msg)
            }

            if (reason == "messageDelete") {
                entradas.forEach(async user => {
                    await client.sleep(1000)
                    client.inQG = await client.inQG.filter(userID => userID != user)
                })
            }

            if (reason == "start") {
                guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
                let roomNumber = guildInfos.countRooms;

                if (guildInfos && guildInfos.countRooms >= 9999) {
                    roomNumber = 1;
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $set: { countRooms: 1 } }
                    )
                }

                entradas.forEach(async userID => {
                    await client.sleep(1000)
                    await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: userID },
                        { $set: { room: roomNumber } }
                    )
                    client.inQG = await client.inQG.filter(m => m != userID)
                })

                const groupOne = await entradas.splice(0, entradas.length / 2)
                const groupTwo = await entradas

                let layouts = [
                    {
                        textChannel: `💬・room-${("0000" + roomNumber).slice(-4)}`,
                        generalVoiceChannel: `⚪ ${("0000" + roomNumber).slice(-4)} - Geral`,
                        t1VoiceChannel: `🟢 ${("0000" + roomNumber).slice(-4)} - T1`,
                        t2VoiceChannel: `🔴 ${("0000" + roomNumber).slice(-4)} - T2`
                    },
                    {
                        textChannel: `💭・room-${("0000" + roomNumber).slice(-4)}`,
                        generalVoiceChannel: `🌴 Geral: ${("0000" + roomNumber).slice(-4)}`,
                        t1VoiceChannel: `🐶 Time 1: ${("0000" + roomNumber).slice(-4)}`,
                        t2VoiceChannel: `🐱 Time 2: ${("0000" + roomNumber).slice(-4)}`
                    },
                    {
                        textChannel: `🎈・room-${("0000" + roomNumber).slice(-4)}`,
                        generalVoiceChannel: `☁️ Geral・${("0000" + roomNumber).slice(-4)}`,
                        t1VoiceChannel: `🌞 T1・${("0000" + roomNumber).slice(-4)}`,
                        t2VoiceChannel: `🌝 T2・${("0000" + roomNumber).slice(-4)}`
                    }
                ]

                let numberLayout = guildInfos.padroes.layoutRoom && guildInfos.padroes.layoutRoom != 0 ? Number(guildInfos.padroes.layoutRoom - 1) : 0

                let roomGuildText = await interaction.guild.channels.create({ name: `${layouts[numberLayout].textChannel}`, type: Discord.ChannelType.GuildText, parent: guildInfos.configs.category, permissionOverwrites: [{ id: interaction.guild.id, deny: [Discord.PermissionFlagsBits.ViewChannel] }] });

                let roomVoiceVC = await interaction.guild.channels.create({ name: `${layouts[numberLayout].generalVoiceChannel}`, type: Discord.ChannelType.GuildVoice, parent: guildInfos.configs.category ?? null, userLimit: numberP });
                await roomVoiceVC.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false, Connect: false });

                let groupOneVC = await interaction.guild.channels.create({ name: `${layouts[numberLayout].t1VoiceChannel}`, type: Discord.ChannelType.GuildVoice, parent: guildInfos.configs.category ?? null, userLimit: numberP / 2 });
                await groupOneVC.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false, Connect: false })

                let groupTwoVC = await interaction.guild.channels.create({ name: `${layouts[numberLayout].t2VoiceChannel}`, type: Discord.ChannelType.GuildVoice, parent: guildInfos.configs.category ?? null, userLimit: numberP / 2 });
                await groupTwoVC.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false, Connect: false })

                groupOne.forEach(async userID => {
                    await client.sleep(1000)
                    const membro = await interaction.guild.members.cache.get(userID)

                    await roomGuildText.permissionOverwrites.create(userID, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
                    await roomVoiceVC.permissionOverwrites.create(userID, { ViewChannel: true, Connect: true, Speak: true })
                    await groupOneVC.permissionOverwrites.create(userID, { ViewChannel: true, Connect: true, Speak: true });
                    await groupTwoVC.permissionOverwrites.create(userID, { ViewChannel: true, Connect: false });
                    if (membro.voice.channelId) await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: userID },
                        { $set: { callOld: membro.voice.channelId } }
                    )
                    client.inQG = await client.inQG.filter(m => m != userID)
                    if (membro.voice.channelId) await interaction.guild.members.cache.get(userID).voice.setChannel(groupOneVC)
                })

                groupTwo.forEach(async userID => {
                    await client.sleep(1000)
                    const membro = await interaction.guild.members.cache.get(userID)

                    await roomGuildText.permissionOverwrites.create(userID, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
                    await roomVoiceVC.permissionOverwrites.create(userID, { ViewChannel: true, Connect: true, Speak: true })
                    await groupTwoVC.permissionOverwrites.create(userID, { ViewChannel: true, Connect: true, Speak: true });
                    await groupOneVC.permissionOverwrites.create(userID, { ViewChannel: true, Connect: false });
                    if (membro.voice.channelId) await client.database.users.findOneAndUpdate(
                        { guildID: interaction.guild.id, userID: userID },
                        { $set: { callOld: membro.voice.channelId } }
                    )
                    client.inQG = await client.inQG.filter(m => m != userID)
                    if (membro.voice.channelId) await interaction.guild.members.cache.get(userID).voice.setChannel(groupTwoVC)
                })

                if (guildInfos.permissions && guildInfos.permissions.seeroomschannel) {
                    guildInfos.permissions.seeroomschannel.forEach(async roleID => {
                        await client.sleep(1000)
                        if (!interaction.guild.roles.cache.get(roleID)) return;
                        await roomGuildText.permissionOverwrites.create(roleID, { ViewChannel: true });
                        await roomVoiceVC.permissionOverwrites.create(roleID, { ViewChannel: true, Connect: true, Speak: true });
                        await groupOneVC.permissionOverwrites.create(roleID, { ViewChannel: true, Connect: true, Speak: true });
                        await groupTwoVC.permissionOverwrites.create(roleID, { ViewChannel: true, Connect: true, Speak: true });
                    })
                }

                if (guildInfos.countRooms < 9999 && guildInfos.countRooms != 1488) {
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $inc: { "countRooms": 1, "dailyRooms": 1 } }
                    )
                } else if ([1487, 1488].includes(guildInfos.countRooms)) {
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $inc: { "countRooms": 2, "dailyRooms": 1 } }
                    )
                }

                client.guilds.cache.get('972930558210478162').channels.cache.get('992075727207944304').send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor('#4CFF40')
                            .setTitle(`LOG | Sala criada`)

                            .addFields([
                                { name: 'Criada por', value: `${interaction.user} (${interaction.user.id})`, inline: true },
                                { name: 'Servidor', value: `${interaction.guild.name} (${interaction.guild.id})` },
                                { name: 'Número da Sala', value: `${roomNumber}`, inline: true }
                            ])
                            .setFooter({ text: 'Horário' })
                            .setTimestamp()
                    ]
                })

                if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                    if (guildInfos.logs.roomLogs) {
                        if (client.channels.cache.get(guildInfos.logs.roomLogs)) client.channels.cache.get(guildInfos.logs.roomLogs).send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setColor('#4CFF40')
                                    .setTitle(`LOG | Sala criada`)
                                    .addFields([
                                        { name: 'Criada por', value: `${interaction.user} (${interaction.user.id})`, inline: true },
                                        { name: 'Sala/ID', value: `${roomGuildText} (${roomGuildText.id})`, inline: true },
                                        { name: 'Time 1', value: `${groupOne.map(u => ` <@${u}>`).join('\n')}`, inline: true },
                                        { name: 'Time 2', value: `${groupTwo.map(u => ` <@${u}> `).join('\n')}`, inline: true },
                                        { name: 'Número da Sala', value: `${roomNumber}`, inline: true }
                                    ])
                                    .setFooter({ text: 'Horário' })
                                    .setTimestamp()
                            ]
                        })
                    }
                }

                let roomOptions = [
                    {
                        label: 'Finalizar Partida',
                        description: `Clique aqui para finalizar a partida. (Apenas capitães)`,
                        value: `closeroom`,
                        emoji: '🚧'
                    },
                    {
                        label: 'Definir Vencedor',
                        description: `Clique aqui para definir que seu time venceu. (Apenas capitães)`,
                        value: `reportWin`,
                        emoji: '🎲'
                    }]

                if ((guildInfos.premium.active && guildInfos.premium.type == "normal") && (guildInfos.systems.activated && guildInfos.systems.activated.indexOf('mvp') != -1)) {
                    await client.database.partidas.create(
                        {
                            guildID: interaction.guild.id,
                            code: roomNumber,
                            textChannel: roomGuildText.id,
                            generalVoiceChannel: roomVoiceVC.id,
                            isWinnerDefined: false,
                            isMVPDefined: false,
                            haveMVP: true,
                            groupOne: { voiceChannel: groupOneVC.id, players: groupOne },
                            groupTwo: { voiceChannel: groupTwoVC.id, players: groupTwo }
                        }
                    )

                    roomOptions.push({
                        label: 'Definir MVP',
                        description: `Clique aqui para definir o MVP. (Apenas capitães)`,
                        value: 'setMVP',
                        emoji: '🦾'
                    })
                } else {
                    await client.database.partidas.create(
                        {
                            guildID: interaction.guild.id,
                            code: roomNumber,
                            textChannel: roomGuildText.id,
                            generalVoiceChannel: roomVoiceVC.id,
                            isWinnerDefined: false,
                            isMVPDefined: false,
                            haveMVP: false,
                            groupOne: { voiceChannel: groupOneVC.id, players: groupOne },
                            groupTwo: { voiceChannel: groupTwoVC.id, players: groupTwo }
                        }
                    )
                }

                await client.database.clients.findOneAndUpdate(
                    { clientID: client.user.id },
                    { $inc: { "chart.todayRooms": 1 } }
                )

                let mainMsg;

                setTimeout(async () => {
                    if (roomGuildText) mainMsg = await roomGuildText.send({
                        content: `${guildInfos.padroes.msgRoom ? guildInfos.padroes.msgRoom + '\n\n<a:stop_sign_gif:991445757922119771> **Esta mensagem foi definida por ADMs do servidor.**' : ''}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setTitle(`<a:fire_gif:935241064699269141> | Partida ${args[0]}`)
                                .setDescription('Seja bem-vindo à partida. Abaixo, você confere os times e o menu de ações, onde os membros da partida poderão definir vencedor, finalizar partida, etc.\nMau uso do BOT ou tentativas de burlar os sistemas resultarão em punições. Bom jogo!')
                                .addFields([
                                    {
                                        name: 'Time 1', value: `${groupOne.map((c, i) => {
                                            i++;
                                            if (i == 1) {
                                                return `**Capitão:** <@${client.users.cache.get(c).id}>`
                                            } else {
                                                return `**Jogador:** <@${client.users.cache.get(c).id}>`
                                            }
                                        }).join('\n')}`, inline: true
                                    },
                                    {
                                        name: 'Time 2', value: `${groupTwo.map((c, i) => {
                                            i++;
                                            if (i == 1) {
                                                return `**Capitão:** <@${client.users.cache.get(c).id}>`
                                            } else {
                                                return `**Jogador:** <@${client.users.cache.get(c).id}>`
                                            }
                                        }).join('\n')}`, inline: true
                                    }
                                ])
                                .setColor('#EE3B3B')
                        ], components: [
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.StringSelectMenuBuilder()
                                    .setCustomId('select')
                                    .setPlaceholder('Selecione o tipo de ação que deseja realizar.')
                                    .setMinValues(1)
                                    .setMaxValues(1)
                                    .addOptions(roomOptions)
                            )
                        ]
                    })

                    if (mainMsg) await mainMsg.pin()
                }, 2000)

                let haveMainMsg = setInterval(async () => {
                    if (!mainMsg && roomGuildText) {
                        mainMsg = await roomGuildText.send({
                            content: `${guildInfos.padroes.msgRoom ? guildInfos.padroes.msgRoom + '\n\n<a:stop_sign_gif:991445757922119771> **Esta mensagem foi definida por ADMs do servidor.**' : ''}`,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setTitle(`<a:fire_gif:935241064699269141> | Partida ${args[0]}`)
                                    .setDescription('Seja bem-vindo à partida. Abaixo, você confere os times e o menu de ações, onde os membros da partida poderão definir vencedor, finalizar partida, etc.\nMau uso do BOT ou tentativas de burlar os sistemas resultarão em punições. Bom jogo!')
                                    .addFields([
                                        {
                                            name: 'Time 1', value: `${groupOne.map((c, i) => {
                                                i++;
                                                if (i == 1) {
                                                    return `**Capitão:** <@${client.users.cache.get(c).id}>`
                                                } else {
                                                    return `**Jogador:** <@${client.users.cache.get(c).id}>`
                                                }
                                            }).join('\n')}`, inline: true
                                        },
                                        {
                                            name: 'Time 2', value: `${groupTwo.map((c, i) => {
                                                i++;
                                                if (i == 1) {
                                                    return `**Capitão:** <@${client.users.cache.get(c).id}>`
                                                } else {
                                                    return `**Jogador:** <@${client.users.cache.get(c).id}>`
                                                }
                                            }).join('\n')}`, inline: true
                                        }
                                    ])
                                    .setColor('#EE3B3B')
                            ], components: [
                                new Discord.ActionRowBuilder().addComponents(
                                    new Discord.StringSelectMenuBuilder()
                                        .setCustomId('select')
                                        .setPlaceholder('Selecione o tipo de ação que deseja realizar.')
                                        .setMinValues(1)
                                        .setMaxValues(1)
                                        .addOptions(roomOptions)
                                )
                            ]
                        })
                        if (mainMsg) await mainMsg.pin()
                    } else { clearInterval(haveMainMsg) }
                }, 3500)

            }
        })
    }
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}