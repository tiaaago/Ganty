const Discord = require('discord.js')
module.exports = {
    rank: "premium",
    name: 'resgatar',
    description: 'Resgate uma assinatura utilizando um código.',
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: 'code',
            description: 'Preencha com o código da assinatura.',
            required: true
        },
    ],
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
        if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('Este servidor não possui **PREMIUM**. Caso você seja o dono dele, adquira em `/premium buy`.')
                    .setColor('#B22222')
                    .setFooter({text: 'Ganty ©'})
            ]
        })

        const code = args[0]
        const codeInfos = guildInfos.codes.find(codes => codes.code == code)
        if (!codeInfos) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`O código inserido não existe.`)
                    .setColor('#FF4040')
            ]
        })

        const time = client.convertTime(codeInfos.time)

        const signDb = await client.database.users.findOne({ guildID: interaction.guild.id, userID: interaction.user.id })
        if (!signDb || !signDb.signature.role || !signDb.signature.finalTime) {
            await client.database.users.findOneAndUpdate(
                { guildID: interaction.guild.id, userID: interaction.user.id },
                {
                    $set: {
                        "signature.role": codeInfos.signature,
                        "signature.lastSignTime": Date.now(),
                        "signature.finalTime": Number(Date.now()) + Number(time)
                    }
                }
            )
        } else {
            await client.database.users.findOneAndUpdate(
                { guildID: interaction.guild.id, userID: interaction.user.id },
                {
                    $set: {
                        "signature.role": codeInfos.signature,
                        "signature.lastSignTime": Date.now()
                    },
                    $inc: {
                        "signature.finalTime": Number(time)
                    }
                }
            )
        }

        interaction.member.roles.add(codeInfos.signature)
        if (guildInfos && guildInfos.assinatura && guildInfos.assinatura.roleFix) interaction.member.roles.add(guildInfos.assinatura.roleFix)

        await client.database.guilds.findOneAndUpdate(
            { guildID: interaction.guild.id },
            { $pull: { codes: { code: code } } }
        )

        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você ativou uma assinatura de **${codeInfos.time}**, aproveite!`)
                    .setColor('#32CD32')
            ]
        })

        if (guildInfos.assinatura.channel) {
            client.channels.cache.get(guildInfos.assinatura.channel).send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle(`LOG | Assinatura ativada`)
                        .setDescription(`${interaction.user} ativou uma assinatura de **${codeInfos.time}**.`)
                ]
            })
        }
    }
}