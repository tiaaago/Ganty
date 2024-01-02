const Discord = require('discord.js')
module.exports = {
    rank: "everyone",
    name: "gerenciarpontos",
    description: "Gerencie os pontos de um membro.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Adicionar pontos.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.User,
                    name: 'user',
                    description: 'Usuário que você deseja adicionar pontos.',
                    required: true
                },
                {
                    type: Discord.ApplicationCommandOptionType.Number,
                    name: 'quantity',
                    description: 'Quantidade de pontos que você deseja adicionar.',
                    required: true
                },
            ]
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remover pontos.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.User,
                    name: 'user',
                    description: 'Usuário que você deseja remover pontos.',
                    required: true,
                },
                {
                    type: Discord.ApplicationCommandOptionType.Number,
                    name: 'quantity',
                    description: 'Quantidade de pontos que você deseja remover.',
                    required: true,
                },
            ]
        },
    ],
    async execute(client, interaction, args) {

        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            if (guildInfos && guildInfos.permissions && guildInfos.permissions.commandaddremovepoints) {
                if (!interaction.member.roles.cache.find(role => guildInfos.permissions.commandaddremovepoints.includes(role.id))) return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            } else {
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            }
        }

        let action = args[0].toLowerCase()
        let usuario = interaction.guild.members.cache.get(args[1])
        let quantia = args[2];

        let memberInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: usuario.id })
        if (!memberInfos) return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Usuário não encontrado no banco de dados.')] })

        if (action == 'add') {
            await client.database.users.findOneAndUpdate(
                { guildID: interaction.guild.id, userID: usuario.id },
                { $inc: { points: quantia } }
            )

            interaction.editReply({
                embeds: [new Discord.EmbedBuilder()
                    .setDescription(`<:barsubindo:935240268544901213> | ${quantia} pontos adicionados para ${client.users.cache.get(usuario.id)}`)
                    .setColor('#32CD32')
                ]
            })
        }

        if (action == 'remove') {
            await client.database.users.findOneAndUpdate(
                { guildID: interaction.guild.id, userID: usuario.id },
                { $inc: { points: -quantia } }
            )

            interaction.editReply({
                embeds: [new Discord.EmbedBuilder()
                    .setDescription(`<:bardescendo:935240303793807382> | ${quantia} pontos removidos de ${client.users.cache.get(usuario.id)}`)
                    .setColor('#CD2626')
                ]
            })
        }
    }
}