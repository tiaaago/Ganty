const Discord = require('discord.js');
var { generate } = require('generate-password');
module.exports = {
    rank: "premium",
    name: "gerarcode",
    description: "Gere um código de assinatura.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Number,
            name: 'id',
            description: `ID da assinatura que deseja dar.`,
            required: true
        },
        {
            type: Discord.ApplicationCommandOptionType.Number,
            name: 'days',
            description: `Quantidade de dias que o usuário ganhará.`,
            required: false
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

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            if (guildInfos && guildInfos.permissions && guildInfos.permissions.commandgerarcoderemassinatura) {
                if (!interaction.member.roles.cache.find(role => guildInfos.permissions.commandgerarcoderemassinatura.includes(role.id))) return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            } else {
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            }
        }

        let id = args[0]

        const signature = guildInfos.assinatura.roles[id - 1]
        if (!signature) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Esse ID de cargo não existe.`)
                    .setColor('#FF4040')
            ]
        })

        const signatureRole = interaction.guild.roles.cache.get(signature.role)

        const days = args[1] ? args[1] : guildInfos.assinatura.roles[id - 1].time

        const code = generate({
            length: 20,
            numbers: true,
            lowercase: false,
        })

        await client.database.guilds.findOneAndUpdate(
            { guildID: interaction.guild.id },
            { $push: { codes: { code: code, time: `${days}d`, signature: signatureRole.id } } }
        )

        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`**Código:** ${code}\n**Dias:** ${days}\n**Assinatura:** ${signatureRole.name} (${signatureRole.id})`)
                    .setColor('#32CD32')
            ]
        })
    }
}