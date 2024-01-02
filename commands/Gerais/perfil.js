const Discord = require('discord.js')
module.exports = {
    rank: "everyone",
    name: "perfil",
    description: 'Veja o seu perfil ou de outros membros do servidor.',
    options: [
        {
            type: Discord.ApplicationCommandOptionType.User,
            name: 'user',
            description: 'Mencione o usuário do qual deseja ver o perfil.',
            required: false
        }
    ],
    async execute(client, interaction, args) {
        let member = interaction.guild.members.cache.get(args[0])
        if (!member) member = interaction.member;

        const badges = [
            {
                name: "Ganty | Developer",
                role: "995921876750704671",
                emoji: "<:developer:996263131426861098>"
            },
            {
                name: "Ganty | Staff",
                role: "870012149467082753",
                emoji: "<:staff:996265393528262657>"
            },
            {
                name: "Ganty | Server Booster",
                role: "927989513492520962",
                emoji: "<a:booster:996266127242035220>"
            },
            {
                name: "Ganty | Bug Hunter",
                role: "995921879380545566",
                emoji: "<:bughunter:996268109440761896>"
            },
            {
                name: "Ganty | Premium",
                role: "995921304614080585",
                emoji: "<:premium:996269082192138364>"
            },
            {
                name: "Ganty | Máquina de Ideias",
                role: "1042905232172138607",
                emoji: "<:suggestive:1042907369371353220>"
            }
        ]

        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
        let memberInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: member.id })

        let gantyGuild = client.guilds.cache.get('869976036274765834')
        let gantyGuildMember = gantyGuild.members.cache.get(member.id)

        const embed = new Discord.EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
            .addFields([
                { name: 'Identificação do Usuário', value: `${member.user.tag} ${Discord.inlineCode(`(${member.id})`)}` },
                { name: 'Estatísticas do Usuário', value: `**Pontos:** ${new Intl.NumberFormat('de-DE').format(memberInfos?.points)}${(guildInfos.premium.active && guildInfos.premium.type == "normal") ? ` ${Discord.inlineCode(`|`)} **Vitórias:** ${new Intl.NumberFormat('de-DE').format(memberInfos?.win)}\n**Derrotas:** ${new Intl.NumberFormat('de-DE').format(memberInfos?.lose)} ${Discord.inlineCode(`|`)} **MVP:** ${new Intl.NumberFormat('de-DE').format(memberInfos?.mvp)}` : ``}` },
                { name: 'Assinatura', value: `${memberInfos?.signature && memberInfos?.signature?.finalTime ? `Assinatura: <@&${memberInfos.signature.role}>\n*Acaba <t:${Math.floor(Number(memberInfos.signature.finalTime) / Number(1000))}:R>*` : "Não possui assinatura ativa."}` },
                { name: 'Última Advertência', value: `${memberInfos?.adv?.length > 0 ? `<t:${Math.floor(Number(memberInfos.adv[memberInfos.adv.length - 1].timestamp) / Number(1000))}:f> ${Discord.inlineCode('|')} ${memberInfos.adv[memberInfos.adv.length - 1].reason}` : `O usuário não recebeu nenhuma advertência.`}` }
            ])
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .setColor('#553AA7')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true, size: 2048 }) })

        if(gantyGuildMember) embed.setDescription(`${badges.filter(badge => gantyGuildMember.roles.cache.has(badge.role)).map(badge => `${badge.emoji} **${badge.name}**`).join('\n')}‎ `)

        if (memberInfos) {
            interaction.editReply({ embeds: [embed] })
        } else return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Usuário não encontrado no banco de dados.')] })
    }
}