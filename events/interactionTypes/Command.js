const Discord = require('discord.js');
const parsems = require('parse-ms');
const { prefix } = require('../../config.json')

module.exports = {
    async execute(client, interaction) {
        await interaction.deferReply()

        if (!interaction.guildId || !interaction.channelId) return interaction.editReply(`Os SlashCommands ainda não podem ser usados na minha DM.`);
        if (!interaction.client.guilds.cache.get(interaction.guildId)) return interaction.editReply(`Eu não fui adicionado corretamente ao servidor.`);

        let guild = await client.database.guilds.findOne({ guildID: interaction.guild.id })
        let user = await client.database.users.findOne({ guildID: interaction.guild.id, userID: interaction.user.id })
        let clientDb = await client.database.clients.findOne({ clientID: client.user.id })
        let userGlobal = await client.database.globalUsers.findOne({ userID: interaction.user.id })

        interaction.args = interaction.options._hoistedOptions.length > 0 ? interaction.options._hoistedOptions.map((x) => x.value) : ""

        interaction.content = `${prefix}${interaction.commandName}${interaction.options._group ? ` ${interaction.options._group}` : ""}${interaction.options._subcommand ? ` ${interaction.options._subcommand}` : ""}${interaction.options._hoistedOptions.length > 0 ? ` ${interaction.options._hoistedOptions.map((x) => x.value).join(' ')}` : ""}`;

        const args = interaction.content.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();

        const getCommand = client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));
        if (!getCommand) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('Este comando não existe.')
                    .setColor('#FF4040')
            ]
        })

        if (clientDb.maintenance && !['776576976630055033', '852610866683445328'].includes(interaction.user.id)) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('🧑‍🔧 **|** Ops... No momento, o Ganty está em manutenção. Por favor, utilizar os comandos novamente em alguns minutos.')
                    .setColor('#FF4040')
            ]
        })

        if (!['869976036274765834'].includes(interaction.guild.id)) {
            if (!getCommand.name.includes('dashboard') && guild.configs.commandChannels.length > 0 && !interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && (guild.permissions.anychatcommand.length > 0 && !interaction.member.roles.cache.find(role => guild.permissions.anychatcommand.includes(role.id))) && !guild.configs.commandChannels.find(channel => channel == interaction.channel.id)) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`${interaction.user}, você não está em um canal de comandos.`)
                        .setColor('#FF4040')
                ]
            })
        }

        await client.database.clients.findOneAndUpdate(
            { clientID: client.user.id },
            { $inc: { "chart.todayCommands": 1 } }
        )

        if (guild.premium.active == true && guild.logs.commandLogs) {
            if (client.channels.cache.get(guild.logs.commandLogs)) client.channels.cache.get(guild.logs.commandLogs).send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor('#E6E6FA')
                        .setTitle(`LOG | Comando utilizado`)
                        .addFields([
                            { name: `Comando`, value: `${cmdName} ${args.toString().replaceAll(',', ' ')}` },
                            { name: `Usuário`, value: `${interaction.user} (${interaction.user.id})` },
                            { name: `Canal`, value: `${interaction.channel} (${interaction.channel.id})` }
                        ])
                        .setFooter({ text: 'Horário' })
                        .setTimestamp()
                ]
            })
        }

        if (client.channels.cache.get('992075710170669127')) {
            client.channels.cache.get('992075710170669127').send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor('#E6E6FA')
                        .setTitle(`LOG | Comando utilizado`)
                        .addFields([
                            { name: `Comando`, value: `${cmdName} ${args.toString().replaceAll(',', ' ')}` },
                            { name: `Usuário`, value: `${interaction.user} (${interaction.user.id})` },
                            { name: `Canal`, value: `${interaction.channel} (${interaction.channel.id})` },
                            { name: `Servidor`, value: `${interaction.guild.name} (${interaction.guild.id})` }
                        ])
                        .setFooter({ text: 'Horário' })
                        .setTimestamp()
                ]
            })
        }

        try {
            let cooldown = 5000

            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
            if (guildInfos.premium.active && guildInfos.premium.type == "normal") cooldown = 2000

            let gantyGuild = client.guilds.cache.get('869976036274765834')
            let gantyGuildAuthorMember = gantyGuild?.members.cache.get(interaction.user.id)
            if (gantyGuildAuthorMember?.roles?.cache?.has('870012149467082753')) cooldown = 0

            let userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: interaction.user.id })
            if (userInfos.cooldown && cooldown - (Date.now() - userInfos.cooldown) > 0) {
                let time = parsems(cooldown - (Date.now() - userInfos.cooldown))

                return interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription(`Você poderá usar esse comando novamente em ${time.seconds > 0 ? `${time.seconds} segundos` : "0 segundos"}.`)
                            .setColor('#FF4040')
                    ]
                })
            } else {
                await client.database.users.findOneAndUpdate(
                    { guildID: interaction.guild.id, userID: interaction.user.id },
                    { $set: { cooldown: Date.now() } }
                )
                getCommand.execute(client, interaction, args)
            }
        } catch (err) {
            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`🧑‍🔧 **|** Opa, pelo visto o BOT ainda não foi configurado corretamente neste servidor. Peça para que um Dono/Administrador configure-o e tente novamente.\n*Dica: em caso de dúvidas, entre no [meu servidor de suporte](https://abre.ai/svganty) e veja o canal #como-configurar*`)
                        .setColor('#FF4040')
                ]
            })

            console.log(err)
        }
    }
}