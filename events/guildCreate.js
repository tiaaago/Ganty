const Discord = require('discord.js');

module.exports = {
    async execute(client, guild) {
        let auditLogs = await guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.BotAdd }).then(audit => audit.entries.first())

        client.guilds.cache.get('972930558210478162').channels.cache.get('992075775102681150').send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle('+1 SERVIDOR!')
                    .setDescription(`Fui adicionado em ${guild.name} (${guild.id}) por ${auditLogs.executor} (${auditLogs.executor.id}), lá possui ${guild.memberCount} membros.\nAgora estou em ${client.guilds.cache.size} servidores.`)
                    .setColor('#32CD32')
            ]
        })

        client.users.cache.get(auditLogs.executor.id).send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setAuthor({ name: 'OBRIGADO POR ME ADICIONAR!' })
                    .setDescription('Olá, eu sou o Ganty! Um BOT de Random-Match, criado com a intenção de facilitar suas jogatinas com seus amigos ou até mesmo em um grupo de ranqueada, possuo funções como sistema de pontuação com ranks, sistema de advertências, assinaturas e muito mais.\n\nAgora que você me adicionou em seu servidor, será necessário que você realize a configuração através do comando `/dashboard`.\n\nCaso precise de ajuda, entre no [meu servidor de suporte](https://abre.ai/svganty).\n*Atenciosamente, Equipe Ganty.*')
                    .setThumbnail('https://cdn.discordapp.com/avatars/966331197821173781/2719c586f3f6ac82adcac38678a10bf6.png?size=2048')
                    .setColor('48D1CC')
            ]
        })

        const guildInfos = await client.database.guilds.findOne({ guildID: guild.id });
        if (guildInfos) {
            await client.database.guilds.findOneAndUpdate(
                { guildID: guild.id },
                { $set: { leaveTimestamp: null } }
            )
        }
    }
}