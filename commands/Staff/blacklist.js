const Discord = require('discord.js');
const ms = require('ms')
module.exports = {
    rank: "dev",
    name: "blacklist",
    description: 'Comando de testes do bot.',
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "Adicione um usuário a blacklist, ele não poderá utilizar o Ganty.",
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.User,
                    name: "user",
                    description: "User/ID do usuário que deseja banir",
                    required: true
                },
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: "reason",
                    description: "Motivo do banimento",
                    required: true
                },
                {
                    type: Discord.ApplicationCommandOptionType.Boolean,
                    name: "warn",
                    description: "Você quer que o Ganty avise o usuário que ele foi blacklisted?",
                    required: true,
                    choices: [
                        {
                            name: "Sim, eu quero.",
                            value: true
                        },
                        {
                            name: "Não, eu não quero.",
                            value: false
                        }
                    ]
                },
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: "time",
                    description: "Tempo que deseja banir",
                    required: false
                },
            ]
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "Remova um usuário a blacklist, ele poderá utilizar o Ganty.",
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.User,
                    name: "user",
                    description: "User/ID do usuário que deseja banir",
                    required: true
                },
            ]
        }
    ],
    async execute(client, interaction, args) {
        const action = args[0]

        if (action == "add") {
            const user = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason");
            const time = interaction.options.getString("time");
            const warn = interaction.options.getBoolean("warn");
            const globalUser = await client.database.globalUsers.findOne({ userID: user.id })

            if (!globalUser) {
                await client.database.globalUsers.create({
                    userID: user.id,
                    blacklisted: {
                        state: true,
                        reason: reason,
                        staff: interaction.user.id,
                        finalTime: time ? Number(Date.now() + ms(time)) : null
                    }
                })

                interaction.editReply(`**USUÁRIO BANIDO COM SUCESSO!**\n\n**Usuário:** ${user}\n**Motivo:** ${reason}\n**Tempo:** ${interaction.options.getString("time")}`)
                client.channels.cache.get('997177063519825950').send(`**USUÁRIO BANIDO COM SUCESSO!**\n\n**Usuário:** ${user}\n**Motivo:** ${reason}\n**Tempo:** ${time != null ? `${time} (acaba(ou) <t:${Math.round(Number(ms(time) + Date.now()) / 1000)}:R>)` : "Permanentemente"}`)
                if (warn == true) user?.send(`> **VOCÊ ESTÁ NA BLACKLIST!**\nOlá! Infelizmente, você foi adicionado na blacklist do Ganty, ou seja, você está banido de usá-lo em qualquer servidor. Veja mais informações abaixo:\n\n**Staff:** ${interaction.user}\n**Motivo:** ${reason}\n**Tempo:** ${time != null ? `${time} (acaba(ou) <t:${Math.round(Number(ms(time) + Date.now()) / 1000)}:R>)` : "Permanentemente"}\n\nVocê pode tentar entrar com um recurso contra esse banimento, basta entrar em [meu servidor de suporte](https://abre.ai/svganty), abrir um ticket em <#997176626758549565> e explicar a sua situação.\nAtenciosamente, Equipe Ganty.`)
            } else {
                if (globalUser.blacklisted.state == true) return interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription(`${interaction.user}, esse usuário já está banido.`)
                            .setColor('#FF4040')
                    ]
                })

                await client.database.globalUsers.findOneAndUpdate(
                    { userID: user.id },
                    {
                        $set: {
                            blacklisted: {
                                state: true,
                                reason: reason,
                                staff: interaction.user.id,
                                finalTime: time ? Number(Date.now() + ms(time)) : null
                            }
                        }
                    }
                )

                interaction.editReply(`**USUÁRIO BANIDO COM SUCESSO!**\n\n**Responsável pelo banimento:** ${interaction.member}\n**Usuário:** ${user}\n**Motivo:** ${reason}\n**Tempo:** ${time ? interaction.options.getString("time") : 'Permanentemente'}`)
                client.channels.cache.get('1076922733054668800').send(`**USUÁRIO BANIDO COM SUCESSO!**\n\n**Responsável pelo banimento:** ${interaction.member}\n**Usuário:** ${user}\n**Motivo:** ${reason}\n**Tempo:** ${time ? `${time} (acaba(ou) <t:${Math.round(Number(ms(time) + Date.now()) / 1000)}:R>)` : 'Permanentemente'}`)
                if (warn == true) user?.send(`> **VOCÊ ESTÁ NA BLACKLIST!**\nOlá! Infelizmente, você foi adicionado na blacklist do Ganty, ou seja, você está banido de usá-lo em qualquer servidor. Veja mais informações abaixo:\n\n**Staff:** ${interaction.user}\n**Motivo:** ${reason}\n**Tempo:** ${time != null ? `${time} (acaba(ou) <t:${Math.round(Number(ms(time) + Date.now()) / 1000)}:R>)` : "Permanentemente"}\n\nVocê pode tentar entrar com um recurso contra esse banimento, basta entrar em [meu servidor de suporte](https://abre.ai/svganty), abrir um ticket em <#997176626758549565> e explicar a sua situação.\nAtenciosamente, Equipe Ganty.`)
            }
        } else {
            const user = interaction.options.getUser("user");
            const globalUser = await client.database.globalUsers.findOne({ userID: user.id });

            if (globalUser && globalUser.blacklisted.state == true) {
                await client.database.globalUsers.findOneAndUpdate(
                    { userID: user.id },
                    {
                        $set: {
                            blacklisted: {
                                state: false,
                                reason: null,
                                staff: null,
                                timestamp: null
                            }
                        }
                    }
                )

                interaction.editReply(`**USUÁRIO DESBANIDO COM SUCESSO!**\n\n**Responsável pelo desbanimento:** ${interaction.member}\n**Usuário:** ${user}`)
                client.channels.cache.get('1076922733054668800').send(`**USUÁRIO DESBANIDO COM SUCESSO!**\n\n**Responsável pelo desbanimento:** ${interaction.member}\n**Usuário:** ${user}`)
                user?.send(`> **VOCÊ FOI RETIRADO DA BLACKLIST!**\nOlá! Você estava na minha blacklist anteriormente, mas foi retirado pelo staff ${interaction.user}.\nCaso tenha sido um erro, pedimos desculpas pelo transtorno, mas caso contrário, esperamos que seu comportamento inadequado não se repita.\nAtenciosamente, Equipe Ganty.`)
            } else return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`${interaction.user}, esse usuário já está desbanido.`)
                        .setColor('#FF4040')
                ]
            })
        }
    }
}