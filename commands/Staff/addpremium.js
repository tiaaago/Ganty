const Discord = require('discord.js')
module.exports = {
    rank: "dev",
    name: "addpremium",
    description: "Comando para adicionar premium em servidores.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: 'time',
            description: 'Insira aqui o tempo do premium.',
            required: true,
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: 'guild',
            description: 'Insira aqui o servidor que receberá o premium.',
            required: true,
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: 'type',
            description: 'Insira aqui o tipo do premium.',
            required: true,
            choices: [
                {
                    name: 'Booster',
                    value: 'booster'
                },
                {
                    name: 'Normal',
                    value: 'normal'
                }
            ]
        },
    ],
    async execute(client, interaction, args) {
        if (!['852610866683445328', '776576976630055033'].includes(interaction.user.id)) return;

        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
        if (!args[0]) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você não definiu o tempo do PREMIUM.`)
                    .setColor('#FF4040')
            ]
        })

        let time = client.convertTime(args[0])
        if (isNaN(time)) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`O tempo precisa ser um número.`)
                    .setColor('#FF4040')
            ]
        })

        let guild = client.guilds.cache.get(args[1])
        if (!guild) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Não encontrei o servidor.`)
                    .setColor('#FF4040')
            ]
        })

        if (!args[2]) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você não especificou o tipo. \`g!addpremium <tempo> <ID do servidor> <tipo (normal/booster)>\``)
                    .setColor('#FF4040')
            ]
        })

        let type = args[2].toLowerCase()
        if (!type || !['normal', 'booster'].includes(type)) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você não especificou o tipo. \`g!addpremium <tempo> <ID do servidor> <tipo (normal/booster)>\``)
                    .setColor('#FF4040')
            ]
        })

        await client.database.guilds.findOneAndUpdate(
            { guildID: guild.id },
            {
                $set: {
                    "premium.active": true,
                    "premium.type": type,
                    "premium.lastBuyTime": Date.now(),
                    "premium.finalTime": Number(Date.now() + time)
                }
            }
        )

        let gantyGuild = client.guilds.cache.get('869976036274765834')
        let gantyGuildMember = gantyGuild?.members.cache.get(interaction.guild.ownerId)

        if (gantyGuildMember) gantyGuildMember.roles.add('995921304614080585')
        if (gantyGuildMember) gantyGuildMember.roles.add('995921722731659274')

        let commands = client.commands.map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options, rank: cmd.rank }));

        if (interaction.guild.id == '972930558210478162') {
            commands = commands.filter(cmd => cmd.rank == "premium" || cmd.rank == "dev").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
            interaction.guild.commands.set(commands);
        } else {
            commands = commands.filter(cmd => cmd.rank == "premium").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
            interaction.guild.commands.set(commands);
        }

        let embed = new Discord.EmbedBuilder()
            .setDescription(`O servidor ${guild.name} (${guild.id}) recebeu ${args[0]} de ${type == 'normal' ? 'PREMIUM' : 'BOOSTER'}.`)
            .setColor('#32CD32')

        interaction.editReply({ embeds: [embed] })
        client.guilds.cache.get('972930558210478162').channels.cache.get('992075652574482462').send({ embeds: [embed.setFooter({ text: `Adicionado por: ${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', size: 2048 })}` })] })
    }
}