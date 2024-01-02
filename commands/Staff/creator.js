const Discord = require('discord.js')
module.exports = {
    rank: "dev",
    name: "creator",
    description: "Comando para criar embeds.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: 'string',
            description: 'Insira aqui o embed.',
            required: true,
        },

    ],
    async execute(client, interaction, args) {
        const jsonEmbed = eval('(' + interaction.options.getString('string') + ')')

        if (!['852610866683445328', '776576976630055033'].includes(interaction.user.id)) return;

        if (!args[0]) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você não inseriu o embed.`)
                    .setColor('#FF4040')
            ]
        })

        interaction.editReply({ embeds: [jsonEmbed] })
    }
}