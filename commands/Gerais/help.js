const Discord = require('discord.js')
module.exports = {
    rank: "everyone",
    name: "help",
    description: 'Veja os comandos do Ganty.',
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const commands = client.commands.map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options, rank: cmd.rank }))

        const arrayCommands = commands.filter(cmd => cmd.rank == "everyone").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }))
        if (guildInfos.premium.active && guildInfos.premium.type == "normal") arrayCommands.concat(commands.filter(cmd => cmd.rank == "premium").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options })))

        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle('🛡️ | Comandos')
                    .setDescription(`${arrayCommands.map(command => `${Discord.inlineCode(`/${command.name}`)} - ${command.description}`).join('\n')}`)
                    .setColor('#1E90FF')
            ]
        })
    }
}