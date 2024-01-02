const Discord = require('discord.js')
module.exports = {
    name: "reset",
    rank: "premium",
    description: "Resete os pontos de todos os membros.",
    options: [],
    async execute(client, message, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: message.guild.id })

        if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return;

        let arrayOptions = []

        arrayOptions.push({
            label: 'Tudo',
            value: 'resetAll',
            emoji: '🎛️'
        })

        arrayOptions.push({
            label: 'Pontos',
            value: 'resetPoints',
            emoji: '🎲'
        })

        if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) arrayOptions.push({
            label: 'Vitórias',
            value: 'resetWin',
            emoji: '🎰'
        })

        if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) arrayOptions.push({
            label: 'Derrotas',
            value: 'resetLose',
            emoji: '🔥'
        })

        if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) arrayOptions.push({
            label: 'MVP',
            value: 'resetMVP',
            emoji: '⚔️'
        })

        let msgEmbed = await message.reply({
            embeds: [new Discord.MessageEmbed()
                .setTitle('🗂️ | Reset')
                .setDescription('No menu de seleção abaixo, insira o que deverá ser resetado.')
                .setColor('#90EE90')
            ], components: [new Discord.MessageActionRow().addComponents(
                new Discord.MessageSelectMenu()
                    .setCustomId('selectReset')
                    .setPlaceholder('Selecione o que você deseja resetar.')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(arrayOptions)
            )]
        })

        const filter = i => i.user.id == message.author.id
        const collector = msgEmbed.createMessageComponentCollector({ filter })

        collector.on('collect', async i => {
            msgEmbed.edit()
            switch (i.values[0]) {
                case "resetAll": {
                    let msgM = await message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(`${i.member}, mencione o membro que deseja resetar, caso queira resetar de todos, apenas envie uma mensagem com \`ALL\`.`)
                                .setColor('#FF4040')
                        ]
                    })

                    const filter = m => m.author.id == message.author.id;
                    const collector = msgM.channel.createMessageCollector({ filter, time: 20000, max: 1 });

                    collector.on('collect', async m => {
                        m.delete()
                        let st;
                        if (m.content.toLowerCase() != 'all') st = m.mentions.members.first() || client.users.cache.get(m.content);

                        if (!st && m.content.toLowerCase() == "all") {

                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar tudo de todos os membros? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()
                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id },
                                        { "$set": { "points": 0, "lose": 0, "win": 0, "mvp": 0, "consecutives": 0 } }
                                    )
                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, todos os membros tiveram **TUDO** resetado!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }

                        if (st) {
                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar tudo de ${st}? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()
                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id, userID: st.id },
                                        { "$set": { "points": 0, "lose": 0, "win": 0, "mvp": 0, "consecutives": 0 } }
                                    )
                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, ${st} teve **TUDO** resetado!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }
                    })
                    break;
                } // resetAll

                case "resetPoints": {
                    let msgM = await message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(`${i.member}, mencione o membro que deseja resetar, caso queira resetar de todos, apenas envie uma mensagem com \`ALL\`.`)
                                .setColor('#32CD32')
                        ]
                    })

                    const filter = m => m.author.id == message.author.id;
                    const collector = msgM.channel.createMessageCollector({ filter, time: 20000, max: 1 });

                    collector.on('collect', async m => {
                        m.delete()
                        let st;
                        if (m.content != 'all') st = m.mentions.members.first() || client.users.cache.get(m.content);

                        if (!st && m.content.toLowerCase() == "all") {
                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar os pontos de todos os membros? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()

                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id },
                                        { "$set": { "points": 0 } }
                                    )

                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, todos os membros tiveram os **PONTOS** resetado!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }

                        if (st) {
                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar os pontos de ${st}? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()

                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id, userID: st.id },
                                        { "$set": { "points": 0 } }
                                    )

                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, ${st} teve os **PONTOS** resetado!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }
                    })
                    break;
                } // resetPoints

                case "resetWin": {
                    let msgM = await message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(`${i.member}, mencione o membro que deseja resetar, caso queira resetar de todos, apenas envie uma mensagem com \`ALL\`.`)
                                .setColor('#32CD32')
                        ]
                    })

                    const filter = m => m.author.id == message.author.id;
                    const collector = msgM.channel.createMessageCollector({ filter, time: 20000, max: 1 });

                    collector.on('collect', async m => {
                        m.delete()
                        let st;
                        if (m.content != 'all') st = m.mentions.members.first() || client.users.cache.get(m.content);

                        if (!st && m.content.toLowerCase() == "all") {

                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar as vitórias de todos os membros? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()

                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id },
                                        { "$set": { "win": 0 } }
                                    )

                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, todos os membros tiveram as **VITÓRIAS** resetadas!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }

                        if (st) {
                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar as vitórias de ${st}? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()

                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id, userID: st.id },
                                        { "$set": { "win": 0 } }
                                    )

                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, ${st} teve as **VITÓRIAS** resetadas!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }
                    })
                    break;
                } // resetWin

                case "resetLose": {
                    let msgM = await message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(`${i.member}, mencione o membro que deseja resetar, caso queira resetar de todos, apenas envie uma mensagem com \`ALL\`.`)
                                .setColor('#32CD32')
                        ]
                    })

                    const filter = m => m.author.id == message.author.id;
                    const collector = msgM.channel.createMessageCollector({ filter, time: 20000, max: 1 });

                    collector.on('collect', async m => {
                        m.delete()
                        let st;
                        if (m.content != 'all') st = m.mentions.members.first() || client.users.cache.get(m.content);

                        if (!st && m.content.toLowerCase() == "all") {

                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar as derrotas de todos os membros? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()

                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id },
                                        { "$set": { "lose": 0 } }
                                    )

                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, mencione o membro que deseja resetar, caso queira resetar de todos, apenas envie uma mensagem com \`ALL\`.`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }

                        if (st) {
                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar as derrotas de ${st}? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()

                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id, userID: st.id },
                                        { "$set": { "lose": 0 } }
                                    )

                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, ${st} teve as **DERROTAS** resetadas!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }
                    })
                    break;
                } // resetLose

                case "resetMVP": {
                    let msgM = await message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(`${i.member}, mencione o membro que deseja resetar, caso queira resetar de todos, apenas envie uma mensagem com \`ALL\`.`)
                                .setColor('#32CD32')
                        ]
                    })

                    const filter = m => m.author.id == message.author.id;
                    const collector = msgM.channel.createMessageCollector({ filter, time: 20000, max: 1 });

                    collector.on('collect', async m => {
                        m.delete()
                        let st;
                        if (m.content != 'all') st = m.mentions.members.first() || client.guild.members.cache.get(m.content);

                        if (!st && m.content.toLowerCase() == "all") {

                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar os MVPs de todos os membros? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()

                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id },
                                        { "$set": { "mvp": 0 } }
                                    )

                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, todos os membros tiveram os **MVPs** resetados!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }

                        if (st) {
                            let msg = await message.reply({ embeds: [new Discord.MessageEmbed().setColor('#E6E6FA').setDescription(`<:alarm:1000846393189081230> | Você tem certeza que deseja resetar os MVPs de ${st}? Tenha em mente que esta ação é irreversível.`).setFooter('Caso não queira, não reaja.')] })
                            await msg.react('<:sim:1000846651289784451>')

                            const filtro = (reaction, user) => user.id === message.author.id;
                            const collector = msg.createReactionCollector(filtro, { time: 60000 });

                            collector.on('collect', async (reaction, user) => {
                                if (reaction.emoji.id === "1000846651289784451") {
                                    if (user.id == client.user.id) return;
                                    msg.delete()

                                    await client.database.users.updateMany(
                                        { guildID: message.guild.id, userID: st.id },
                                        { "$set": { "mvp": 0 } }
                                    )

                                    await message.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                                .setDescription(`${i.member}, ${st} teve os **MVPs** resetados!`)
                                                .setColor('#32CD32')
                                        ]
                                    })
                                }
                            })
                        }
                    })
                    break;
                } // resetMVP
            }
        })
    }
}