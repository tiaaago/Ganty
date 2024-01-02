const Discord = require('discord.js');

module.exports = {
    rank: "dev",
    name: "ping",
    description: 'Comando de testes do bot.',
    options: [],
    async execute(client, interaction, args) {

        const pingEmbed = new ClientEmbed(author)
            .setAuthor({
                name: '🏓 | Pingando...'
            });

        const msg = await message.reply({
            content: author.toString(),
            embeds: [pingEmbed]
        });

        const ping2 = new ClientEmbed(author)
            .setTitle('🏓 | Pong!')
            .setDescription(`**⏱️ | Latência do BOT:** \`${Math.round(this.client.ws.ping)}ms\`\n**⚡ | Latência da API:** \`${msg.createdTimestamp - message.createdTimestamp}ms\``);

        return msg.edit({
            content: author.toString(),
            embeds: [ping2]
        });
    }

};