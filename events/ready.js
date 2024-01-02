const Discord = require('discord.js');
const cron = require('node-cron')
const moment = require('moment')
const axios = require('axios')
const chalk = require('chalk')

module.exports = {
    async execute(client) {
        if (client.user.id == "966331197821173781") {
            async function verifications() {
                /* ============== ATUALIZAR O CONTADOR DO TOP.GG ============== */

                axios({
                    method: 'post',
                    url: 'https://top.gg/api/bots/966331197821173781/stats',
                    headers: { Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk2NjMzMTE5NzgyMTE3Mzc4MSIsImJvdCI6dHJ1ZSwiaWF0IjoxNjYxMDE2NjU0fQ.fF2SASNHAe2gdBV5_4HLi-xZpn5CwZbRhJH-oGNH4gw' },
                    data: {
                        server_count: client.guilds.cache.size,
                    }
                })
                    .catch(err => console.log(chalk.bold.white.bgGreen(`[TOP.GG] | Ocorreu um erro ao atualizar a contagem de servidores`), err))

                /* ============== PUXAR INFORMAÇÕES DA DATABASE DO GANTY ============== */

                const users = await client.database.users.find()
                const guilds = await client.database.guilds.find()
                const globalUsers = await client.database.globalUsers.find()

                /* ============== REMOVER ASSINATURAS DE USUÁRIOS QUE JÁ EXPIRARAM ============== */
                if (users.length > 0) {
                    users.forEach(async userDb => {
                        const guild = client.guilds.cache.get(userDb.guildID)
                        if (!guild) return;
                        const guildInfos = guilds.find(guild => guild.guildID == userDb.guildID)
                        const member = guild.members.cache.get(userDb.userID)
                        if (!member) return;

                        if (userDb.signature.finalTime != null && Date.now() > userDb.signature.finalTime) {
                            await client.database.users.findOneAndUpdate(
                                { guildID: guild.id, userID: member.user.id },
                                { $set: { "signature.finalTime": null, "signature.role": null } }
                            )

                            if (member) {
                                member.send(`A sua assinatura no servidor **${guild.name}** acabou e o seu cargo foi removido.`)
                                member.roles.remove(userDb.signature.role)
                                if (guildInfos.assinatura.roleFix) member.roles.remove(guildInfos.assinatura.roleFix)
                            }

                            if (guildInfos.assinatura.channel && client.channels.cache.get(guildInfos.assinatura.channel)) {
                                client.channels.cache.get(guildInfos.assinatura.channel).send({
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setTitle(`LOG | Assinatura expirada`)
                                            .setDescription(`A assinatura do membro ${member ? member : 'desconhecido'} expirou e seus cargos foram removidos.`)
                                    ]
                                })
                            }
                        }

                        await client.sleep(1000)
                    })
                }

                await client.sleep(5000)

                /* ============== DELETAR DA DATABASE USUÁRIOS E SERVIDORES QUE NÃO ESTÃO MAIS NO GANTY ============== */
                if (guilds.length > 0) {
                    guilds.forEach(async guildInfos => {
                        const guild = client.guilds.cache.get(guildInfos.guildID)
                        const guildUsers = users.filter(userDb => userDb.guildID == guildInfos.guildID)

                        if (guildInfos.leaveTimestamp && Date.now() > Number(guildInfos.leaveTimestamp) + Number(1000 * 60 * 60 * 24 * 7)) {
                            if (guild) return await client.database.guilds.findOneAndUpdate(
                                { guildID: guildInfos.guildID },
                                { $set: { leaveTimestamp: null } }
                            )
                            await client.database.guilds.findOneAndDelete({ guildID: guildInfos.guildID })
                            await client.database.users.deleteMany({ guildID: guildInfos.guildID })
                            console.log(chalk.bold.white.bgRed(`[DATABASE] | [CLEAN-TIME] ⛔ Guild ${guildInfos.guildID} & Users`))
                        } else if (!guildInfos.leaveTimestamp && !guild) {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: guildInfos.guildID },
                                { $set: { leaveTimestamp: Date.now() } }
                            )
                        }

                        if (guild) {
                            guildUsers.forEach(async userInfos => {
                                const member = guild?.members.cache.get(userInfos.userID)

                                if (userInfos.leaveTimestamp && Date.now() > Number(userInfos.leaveTimestamp) + Number(1000 * 60 * 60 * 24 * 7)) {
                                    if (member) return await client.database.guilds.findOneAndUpdate(
                                        { guildID: userInfos.guildID, userID: userInfos.userID },
                                        { $set: { "leaveTimestamp": null } }
                                    )
                                    await client.database.users.findOneAndDelete({ userID: userInfos.userID, guildID: userInfos.guildID })
                                    console.log(chalk.bold.white.bgRed(`[DATABASE] | [CLEAN-TIME] ⛔ User ${userInfos.userID} in ${userInfos.guildID}`))
                                } else if (!userInfos.leaveTimestamp && !member) {
                                    await client.database.users.findOneAndUpdate(
                                        { guildID: userInfos.guildID, userID: userInfos.userID },
                                        { $set: { leaveTimestamp: Date.now() } }
                                    )
                                } else return;

                                await client.sleep(1500)
                            })
                        }

                        await client.sleep(1500)
                    })
                }

                await client.sleep(5000)

                /* ============== REMOVER ASSINATURAS PREMIUM QUE JÁ EXPIRARAM ============== */
                if (guilds.length > 0) {
                    guilds.forEach(async guildDb => {
                        const guild = client.guilds.cache.get(guildDb.guildID)
                        if (!guild) return;
                        const guildInfos = guilds.find(guild => guild.guildID == guildDb.guildID)
                        const owner = client.users.cache.get(guild.ownerId)

                        if (guildInfos.premium.active && Date.now() > guildInfos.premium.finalTime) {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: guild.id },
                                { $set: { "premium.active": false, "premium.lastBuyTime": null, "premium.finalTime": null, "premium.type": null } }
                            )

                            const gantyServer = client.guilds.cache.get('869976036274765834')
                            const ownerMember = gantyServer.members.cache.get(guild.ownerId)
                            if (ownerMember) ownerMember.roles.remove('995921304614080585')

                            owner.send(`> ⏰ **SUA ASSINATURA CHEGOU AO FIM!**\n\nOlá, ${owner}! Tudo bem? 🙋‍♂️\nInfelizmente, devido a falta de pagamento, hoje nós tivemos que encerrar as suas vantagens de assinante premium! 😔\nMas, caso você queira continuar na família de assinantes, basta utilizar o comando </premium buy:1009924977656610920> no servidor que deseja renovar.\nLembre-se de que ser um assinante trás consigo muitas vantagens, como desligamento do limite de partidas diárias, sistemas de logs, assinatura, advertências e muito mais! Poxa, vai perder mesmo essa chance? 🤭\nPara todos os casos, esperamos que você tenha tido uma ótima experiência conosco e volte um dia a fazer parte da família! 🫂\n\n**Beijos de luz, Ganty** 💕`)
                            client.guilds.cache.get('972930558210478162').channels.cache.get('992499547966292078').send({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`O PREMIUM de ${guild.name} (${guild.id}) acabou.`)
                                        .setColor('#FF4040')
                                ]
                            })

                            if (guild.id == '972930558210478162') {
                                guild.commands.set(client.commands.premiumArray.concat(client.commands.devArray));
                            } else {
                                guild.commands.set(client.commands.premiumArray);
                            }
                        } else if (Date.now() > Math.floor(Number(guildInfos.premium.finalTime) - Number(604800000)) && Date.now() < Number(guildInfos.premium.finalTime)) {
                            let clientInfos = await client.database.clients.findOne({ clientID: client.user.id })

                            if (!(clientInfos.premiumMessages ? clientInfos.premiumMessages : []).find(serverID => serverID == guild.id)) {
                                owner.send(`> ⏰ **SUA ASSINATURA ESTÁ CHEGANDO AO FIM!**\n\nOlá, ${owner}! Tudo bem? 🙋‍♂️\nEstava verificando meus sistemas e percebi que a sua assinatura premium irá expirar <t:${Math.floor(Number(guildInfos.premium.finalTime) / Number(1000))}:R>. 😔\nSó passando para avisar que você pode renovar sua assinatura sem necessidade de entrar em contato com a Equipe. Legal, né? 😎 Basta usar o meu comando </premium buy:1009924977656610920> no servidor que deseja renovar.\nMas, caso você tenha alguma dúvida ou precise de alguma ajuda, não hesite em entrar em nosso [servidor de suporte](https://abre.ai/svganty) e abrir um ticket! 🤗\n\n**Beijos de luz, Ganty** 💕`)

                                await client.database.clients.findOneAndUpdate(
                                    { clientID: client.user.id },
                                    { $push: { "premiumMessages": guild.id } }
                                )
                            } else {
                                return;
                            }
                        }

                        await client.sleep(1000)
                    })
                }

                await client.sleep(5000)

                /* ============== REMOVER BLACKLISTS EXPIRADAS ============== */
                if (globalUsers.length > 0) {
                    const filteredUsers = globalUsers.filter(user => user.blacklisted.state && user.blacklisted.finalTime > Date.now())
                    filteredUsers.forEach(userDb => {
                        const user = client.users.cache.get(userDb.userID)
                        if (!user) return;

                        user.send(`> **VOCÊ SAIU DA BLACKLIST!**\nEba! Você está livre novamente, aproveite sua liberdade e volte a utilizar o Ganty em qualquer servidor que você queira, só não se esqueça de seguir as regras dessa vez. 😉\n\nAtenciosamente, Equipe Ganty.`)

                        client.database.globalUsers.findOneAndUpdate(
                            { userID: userDb.userID },
                            { $set: { blacklisted: { state: false, reason: null, staff: null, finalTime: null } } }
                        )

                        client.channels.cache.get('1076922733054668800').send(`**O tempo de blacklist do usuário ${user} (${user.id}) acabou e ele foi liberado novamente.**\n\n**Motivo da Blacklist:**${userDb.blacklisted.reason}\n**Staff que aplicou:** ${client.users.cache.get(userDb.blacklisted.staff)} (${userDb.blacklisted.staff})`)
                    })
                }
            }
            verifications()
            setInterval(() => verifications(), 2 * 60000)

            async function attChannels() {
                let usersCount = 0
                client.guilds.cache.forEach((guild) => {
                    usersCount += guild.memberCount
                })

                let countServer = client.guilds.cache.get('869976036274765834').channels.cache.get('997174114395631637')
                let countUser = client.guilds.cache.get('869976036274765834').channels.cache.get('997174147262185512')

                await countServer.setName(`🔮・${new Intl.NumberFormat('de-DE').format(client.guilds.cache.size)} Servidores`)
                await countUser.setName(`👥・${new Intl.NumberFormat('de-DE').format(usersCount)} Usuários`)
            }
            attChannels()
            setInterval(() => attChannels(), 5 * 60000)

            const usersInRoom = await client.database.users.find()
            const partidasArray = await client.database.partidas.find()

            let concluded = false;

            if (usersInRoom.length > 0) {
                usersInRoom.forEach(async conteudo => {
                    let guild = client.guilds.cache.get(conteudo.guildID)
                    if (!conteudo.room) return;
                    const pesquisarPartida = partidasArray.find(c => c.code == conteudo.room)

                    if (!pesquisarPartida) {
                        await client.database.users.findOneAndUpdate(
                            { guildID: conteudo.guildID, userID: conteudo.userID },
                            { $set: { room: null } }
                        )
                    } else {
                        let channelPartida = false;
                        if (guild && guild.channels && guild.channels.cache && guild.channels.cache.get(pesquisarPartida.textChannel)) channelPartida = guild.channels.cache.get(pesquisarPartida.textChannel)

                        if (!channelPartida || !channelPartida.lastPinTimestamp) {
                            await client.database.users.findOneAndUpdate(
                                { guildID: conteudo.guildID, userID: conteudo.userID },
                                { $set: { room: null } }
                            )
                        }
                    }
                })
                concluded = true;
            }

            if (!concluded && partidasArray.length > 0) {
                partidasArray.forEach(async conteudo => {
                    const guild = client.guilds.cache.get(conteudo.guildID)
                    const searchChannel = guild.channels.cache.get(conteudo.textChannel)

                    if (!searchChannel) {
                        await client.database.partidas.findOneAndDelete(
                            { guildID: conteudo.guildID, textChannel: conteudo.textChannel }
                        )
                    }
                })
            }

            cron.schedule('00 00 00 * * *', async () => {
                let guilds = await client.database.guilds.find()

                let usersCount = 0
                client.guilds.cache.forEach((guild) => {
                    usersCount += guild.memberCount
                })

                let clientDb = await client.database.clients.findOne({ clientID: client.user.id })
                let chartGuilds = Number(client.guilds.cache.size - clientDb.chart.guilds)
                let chartUsers = Number(usersCount - clientDb.chart.users)
                let chartCommands = Number(clientDb.chart.todayCommands - clientDb.chart.lastCommands)
                let chartRooms = Number(clientDb.chart.todayRooms - clientDb.chart.lastRooms)

                client.channels.cache.get('1008527797305737237').send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle('CHART DIÁRIO')
                            .setDescription(`**Antes:** 🔮・${clientDb.chart.guilds} Servidores\n**Agora:** 🔮・${new Intl.NumberFormat('de-DE').format(client.guilds.cache.size)} Servidores\n**Diferença:** ${chartGuilds >= 0 ? `<:barsubindo:935240268544901213>・+${new Intl.NumberFormat('de-DE').format(chartGuilds)} Servidores` : `<:bardescendo:935240303793807382>・${new Intl.NumberFormat('de-DE').format(chartGuilds)} Servidores`}\n\n**Antes:** 👥・${new Intl.NumberFormat('de-DE').format(clientDb.chart.users)} Usuários\n**Agora:** 👥・${new Intl.NumberFormat('de-DE').format(usersCount)} Usuários\n**Diferença:** ${chartUsers >= 0 ? `<:barsubindo:935240268544901213>・+${new Intl.NumberFormat('de-DE').format(chartUsers)} Usuários` : `<:bardescendo:935240303793807382>・${new Intl.NumberFormat('de-DE').format(chartUsers)} Usuários`}\n\n**Antes:** 🎲・${new Intl.NumberFormat('de-DE').format(clientDb.chart.lastCommands)} Comandos\n**Agora:** 🎲・${new Intl.NumberFormat('de-DE').format(clientDb.chart.todayCommands)} Comandos\n**Diferença:** ${chartCommands >= 0 ? `<:barsubindo:935240268544901213>・+${new Intl.NumberFormat('de-DE').format(chartCommands)} Comandos` : `<:bardescendo:935240303793807382>・${new Intl.NumberFormat('de-DE').format(chartCommands)} Comandos`}\n\n**Antes:** 🎮・${new Intl.NumberFormat('de-DE').format(clientDb.chart.lastRooms)} Partidas\n**Agora:** 🎮・${new Intl.NumberFormat('de-DE').format(clientDb.chart.todayRooms)} Partidas\n**Diferença:** ${chartRooms >= 0 ? `<:barsubindo:935240268544901213>・+${new Intl.NumberFormat('de-DE').format(chartRooms)} Partidas` : `<:bardescendo:935240303793807382>・${new Intl.NumberFormat('de-DE').format(chartRooms)} Partidas`}`)
                            .setColor('#FF8C00')
                            .setTimestamp()
                    ]
                })

                await client.database.clients.findOneAndUpdate(
                    { clientID: client.user.id },
                    { $set: { "chart.guilds": client.guilds.cache.size, "chart.users": usersCount }, "chart.lastCommands": clientDb.chart.todayCommands, "chart.todayCommands": 0, "chart.lastRooms": clientDb.chart.todayRooms, "chart.todayRooms": 0 }
                )

                if (guilds.length > 0) {
                    guilds.forEach(async guildInfos => {
                        const guild = client.guilds.cache.get(guildInfos.guildID)
                        if (!guild) return;
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: guild.id },
                            { $set: { "dailyRooms": Number(0) } }
                        )
                    })
                }
            }, {
                scheduled: true,
                timezone: "America/Sao_Paulo"
            })
        }

        console.log(`O BOT foi iniciado com sucesso.`)

        let status = [
            { name: `me adicione em seu servidor! 🤖 | abre.ai/svganty`, type: Discord.ActivityType.Watching },
            { name: `entre em meu servidor: abre.ai/svganty 👀`, type: Discord.ActivityType.Watching },
            { name: `abre.ai/svganty 💡`, type: Discord.ActivityType.Watching },
        ]

        function setStatus() {
            let randomStatus = status[Math.floor(Math.random() * status.length)]
            client.user.setActivity(randomStatus)
        }
        setStatus();
        setInterval(() => setStatus(), 15000)
    }
}