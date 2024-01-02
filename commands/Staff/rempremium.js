const Discord = require('discord.js')
module.exports = {
    rank: "dev",
    name: "rempremium",
    description: "Remover a assinatura premium de um servidor.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: 'guild',
            description: 'Insira aqui o servidor que perderá o premium.',
            required: true,
        },
    ],
    async execute(client, interaction, args) {
        if (!['852610866683445328', '776576976630055033'].includes(interaction.user.id)) return;

        let guild = client.guilds.cache.get(args[0])
        let guildID;

        if (guild) guildID = client.guilds.cache.get(args[0]).id
        if (!guild) guildID = args[0]

        let guildInfos = await client.database.guilds.findOne({ guildID: guildID })

        if (guildInfos && !guildInfos.premium.active) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('Este servidor não possui PREMIUM.')
                    .setColor('#FF4040')
            ]
        })

        await client.database.guilds.findOneAndUpdate(
            { guildID: guildID },
            {
                $set: {
                    "premium.active": false,
                    "premium.type": null,
                    "premium.lastBuyTime": null,
                    "premium.finalTime": null
                }
            }
        )

        let commands = client.commands.map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options, rank: cmd.rank }));

        if (interaction.guild.id == '972930558210478162') {
            commands = commands.filter(cmd => cmd.rank == "dev").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
            interaction.guild.commands.set(commands);
        } else {
            interaction.guild.commands.set([]);
        }

        let embed = new Discord.EmbedBuilder()
            .setDescription(`O servidor ${guild ? guild.name : 'desconhecido'} (${guildID}) teve o ${guildInfos.premium.type == 'normal' ? 'PREMIUM' : 'BOOSTER'} retirado.`)
            .setColor('#FF4040')

        interaction.editReply({ embeds: [embed] })
        client.guilds.cache.get('972930558210478162').channels.cache.get('992075685327806494').send({ embeds: [embed.setFooter({ text: `Adicionado por: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ format: 'webp', size: 2048 }) })] })
    }
}