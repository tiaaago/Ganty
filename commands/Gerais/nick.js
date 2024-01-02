const Discord = require('discord.js')
module.exports = {
    rank: "everyone",
    name: "nick",
    description: 'Defina um nickname para usar no servidor.',
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: 'nick',
            description: 'Defina o nick que você quer utilizar.',
            required: true
        }
    ],
    async execute(client, interaction, args) {
        let nick = args.join(' ')
        if (!nick) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você não definiu o nick que deseja utilizar.`)
                    .setColor('#FF4040')
            ]
        })

        if (nick.length > 18) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`O nick definido é muito grande, o máximo que posso adicionar é 18 caracteres.`)
                    .setColor('#FF4040')
            ]
        })

        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`<:wrench:935238867039166464> | Nick de ${interaction.user.tag}`)
                    .setDescription(`O seu nick foi definido para ${nick}.`)
                    .setColor('#B0C4DE')
            ]
        })

        await client.database.users.findOneAndUpdate(
            { guildID: interaction.guild.id, userID: interaction.user.id },
            { "$set": { "nick": nick } }
        )
    }
}