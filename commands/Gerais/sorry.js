const Discord = require('discord.js')
module.exports = {
    rank: "everyone",
    name: "sorry",
    description: 'Resgate um prêmio.',
    options: [],
    async execute(client, interaction, args) {
        let time = 1681776000000;
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id });
        let clientInfos = await client.database.clients.findOne({ clientID: client.user.id });

        if (Date.now() > time) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Essa recompensa já passou da data de resgate.`)
                    .setColor('#FF4040')
            ]
        })

        if (clientInfos.sorryPremium.find(x => x == interaction.guild.id)) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você já resgatou essa recompensa.`)
                    .setColor('#FF4040')
            ]
        })

        if (guildInfos.premium.active && guildInfos.premium.type != "booster") return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`Você já possui o premium adquirido.`)
                    .setColor('#FF4040')
            ]
        })

        await client.database.guilds.findOneAndUpdate(
            { guildID: interaction.guild.id },
            { $set: { "premium.active": true, "premium.type": "normal", "premium.finalTime": Number(1681776000000), "premium.lastBuyTime": Date.now() } }
        );

        await client.database.clients.findOneAndUpdate(
            { clientID: client.user.id },
            { $push: { "sorryPremium": interaction.guild.id } }
        );

        let commands = client.commands.map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options, permission: cmd.permission }));

        if (interaction.guild.id == '972930558210478162') {
            commands = commands.filter(cmd => cmd.permission == "premium" || cmd.permission == "dev").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
            interaction.guild.commands.set(commands);
        } else {
            commands = commands.filter(cmd => cmd.permission == "premium").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
            interaction.guild.commands.set(commands);
        }

        interaction.editReply('**A ASSINATURA FOI RESGATADA!**\nAproveite o seu premium até o dia **17/04/2023**\n\n*Novamente, a Equipe Ganty pede desculpas pelo transtorno.*');
    }
}