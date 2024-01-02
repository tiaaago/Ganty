const Discord = require('discord.js');
var { generate } = require('generate-password');
module.exports = {
    rank: "premium",
    name: "removerassinatura",
    description: 'Remova a assinatura de um membro do servidor.',
    options: [
        {
            type: Discord.ApplicationCommandOptionType.User,
            name: 'user',
            description: 'Selecione o usuário que você deseja remover.',
            required: true
        }
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

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            if (guildInfos && guildInfos.permissions && guildInfos.permissions.commandgerarcoderemassinatura) {
                if (!interaction.member.roles.cache.find(role => guildInfos.permissions.commandgerarcoderemassinatura.includes(role.id))) return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            } else {
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            }
        }

        const member = interaction.guild.members.cache.get(args[0])
        if (!member) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você não mencionou um membro ou ID de um membro.`)
                    .setColor('#FF4040')
            ]
        })

        const signDb = await client.database.users.findOne({ guildID: interaction.guild.id, userID: member.id })
        if (!signDb.signature.finalTime) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Este membro não possui uma assinatura ativa.`)
                    .setColor('#FF4040')
            ]
        })

        member.roles.remove(signDb.signature.role)

        await client.database.users.findOneAndDelete(
            { guildID: interaction.guild.id, userID: member.id },
            { $set: { signature: null } }
        )

        if (guildInfos && guildInfos.assinatura && guildInfos.assinatura.roleFix) member.roles.remove(guildInfos.assinatura.roleFix)

        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`A assinatura do membro ${member} foi removida com sucesso.`)
                    .setColor('#FF4040')
            ]
        })

        if (guildInfos.assinatura.channel) {
            client.channels.cache.get(guildInfos.assinatura.channel).send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle(`LOG | Assinatura removida`)
                        .setDescription(`O staff ${interaction.member} removeu a assinatura de ${member}.`)
                ]
            })
        }
    }
}