const Discord = require('discord.js')
module.exports = {
    rank: "premium",
    name: "gerenciarvitorias",
    description: "Gerencie vitórias de um membro do servidor.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Adicionar vitórias.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.User,
                    name: 'user',
                    description: 'Usuário que você deseja adicionar vitórias.',
                    required: true
                },
                {
                    type: Discord.ApplicationCommandOptionType.Number,
                    name: 'quantity',
                    description: 'Quantidade de vitórias que você deseja adicionar.',
                    required: true
                },
            ]
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remover vitórias.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.User,
                    name: 'user',
                    description: 'Usuário que você deseja remover vitórias.',
                    required: true,
                },
                {
                    type: Discord.ApplicationCommandOptionType.Number,
                    name: 'quantity',
                    description: 'Quantidade de vitórias que você deseja remover.',
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
                    .setFooter({text: 'Ganty ©'})
            ]
        })

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            if (guildInfos && guildInfos.permissions && guildInfos.permissions.commandaddremovepoints) {
                if (!interaction.member.roles.cache.find(role => guildInfos.permissions.commandaddremovepoints.includes(role.id))) return interaction.editReply({embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            } else {
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            }
        }

        let action = args[0].toLowerCase()
        let usuario = interaction.guild.members.cache.get(args[1])
        let quantia = args[2];

        let memberInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: usuario.id })

        if (action == 'add') {
            await client.database.users.findOneAndUpdate(
                { guildID: interaction.guild.id, userID: usuario.id },
                { $inc: { win: quantia } }
            )

            interaction.editReply({
                embeds: [new Discord.EmbedBuilder()
                    .setDescription(`<:barsubindo:935240268544901213> | ${quantia} vitórias adicionadas para ${client.users.cache.get(usuario.id)}`)
                    .setColor('#32CD32')
                ]
            })
        }

        if (action == 'remove') {
            await client.database.users.findOneAndUpdate(
                { guildID: interaction.guild.id, userID: usuario.id },
                { $inc: { win: -quantia } }
            )

            interaction.editReply({
                embeds: [new Discord.EmbedBuilder()
                    .setDescription(`<:bardescendo:935240303793807382> | ${quantia} vitórias removidas de ${client.users.cache.get(usuario.id)}`)
                    .setColor('#CD2626')
                ]
            })
        }
    }
}