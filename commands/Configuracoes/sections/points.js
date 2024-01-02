const Discord = require('discord.js')
module.exports = {
    name: 'Pontos',
    description: 'Gerencie a quantia de pontos dados em partidas.',
    emoji: '991745991252394014',
    value: 'points',
    premiumConfig: false,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            const embed = new Discord.EmbedBuilder()
                .setTitle("Dashboard — Pontos")
                .setColor('#B9D3EE')
                .setDescription("Seja bem vindo ao painel de gerenciamento de pontos, aqui você pode - sem muita dificuldade - definir a quantia de pontos que serão distribuídos nas partidas.\n\nCaso queira alterar algo, basta utilizar os botões ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                .addFields([
                    { name: `Pontos por vitória`, value: `${guildInfos.configs.points.win} pontos` },
                    { name: `Pontos por derrota`, value: `${guildInfos.configs.points.lose} pontos` },
                ])
                .setFooter({ text: 'Ganty ©' })
                .setTimestamp()

            if (guildInfos && guildInfos.premium.active && guildInfos.premium.type == "normal") embed.addFields([{ name: `Pontos para MVP`, value: `${guildInfos.configs.points.mvp}` }]);
            embed.addFields([{ name: `Vitórias Consecutivas`, value: `${guildInfos.configs.points.consecutives}` }])

            interaction.editReply({
                embeds: [embed],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configPoints')
                                .setPlaceholder('Selecione a ação que você deseja executar.')
                                .setMinValues(1)
                                .setMaxValues(1)
                                .addOptions([
                                    {
                                        label: 'Voltar para a página inicial',
                                        description: 'Clique aqui para voltar para a página inicial do dashboard.',
                                        emoji: '992173657067634808',
                                        value: 'homepage',
                                    },
                                    {
                                        label: 'ㅤ',
                                        value: 'nullOption1',
                                    },
                                    {
                                        label: 'Configurar | Pontos',
                                        description: 'Clique aqui para setar quantos pontos irão rodar por partida.',
                                        value: 'setPoints',
                                        emoji: '991745991252394014'
                                    },
                                ])
                                .setDisabled(disabled)
                        ),
                ]
            })
        }

        await attMainMessage(interaction, false)

        const intMsg = await interaction.fetchReply()
        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id });

            switch (i.values[0]) {
                case 'homepage': {
                    if (i.replied != true) await i.deferUpdate()
                    const dashboardHomepage = require('../dashboard.js')

                    collector.stop('back to homepage')
                    dashboardHomepage.execute(client, interaction, args, true)
                    break;
                } // homePage

                case "setPoints": {
                    const modal = new Discord.ModalBuilder()
                        .setCustomId('setPointsModal')
                        .setTitle('Dashboard | Pontos')
                        .addComponents(
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.TextInputBuilder()
                                        .setCustomId('pointsWinInput')
                                        .setLabel("Pontos por vitória:")
                                        .setPlaceholder("Digite aqui a quantia de pontos para vencedores.")
                                        .setStyle(Discord.TextInputStyle.Short)
                                ),

                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.TextInputBuilder()
                                        .setCustomId('pointsLoseInput')
                                        .setLabel("Pontos por derrota:")
                                        .setPlaceholder("Digite aqui a quantia de pontos para perdedores.")
                                        .setStyle(Discord.TextInputStyle.Short)
                                ),
                        )

                    if (guildInfos && guildInfos.premium.active && guildInfos.premium.type == 'normal') {
                        modal.addComponents(new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.TextInputBuilder()
                                    .setCustomId('pointsMVPInput')
                                    .setLabel("Pontos por MVP:")
                                    .setPlaceholder("Digite aqui a quantia de pontos para MVPs.")
                                    .setStyle(Discord.TextInputStyle.Short)
                            ),
                        )
                    }

                    modal.addComponents(new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.TextInputBuilder()
                                .setCustomId('winConsecutiveInput')
                                .setLabel("Vitórias para vitórias consecutivas:")
                                .setPlaceholder("Digite aqui a quantia de vitórias para vitórias consecutivas.")
                                .setStyle(Discord.TextInputStyle.Short)
                        ))

                    await i.showModal(modal)

                    const filter = i => i.user.id == interaction.user.id;
                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let winPoints = res.fields.getTextInputValue('pointsWinInput').toLowerCase();
                            let losePoints = res.fields.getTextInputValue('pointsLoseInput').toLowerCase();
                            let mvpPoints;
                            if (guildInfos && guildInfos.premium.active && guildInfos.premium.type == 'normal') mvpPoints = res.fields.getTextInputValue('pointsMVPInput').toLowerCase();
                            let consecutiveWins = res.fields.getTextInputValue('winConsecutiveInput').toLowerCase();

                            if (winPoints) {
                                if (isNaN(winPoints) || winPoints < 0) {
                                    winPoints = null
                                    return interaction.followUp({
                                        embeds: [
                                            new Discord.EmbedBuilder().
                                                setColor('#FF4040').
                                                setDescription('Você não definiu uma quantidade de pontos válida.')]
                                    })
                                }

                                await client.database.guilds.findOneAndUpdate(
                                    { guildID: interaction.guild.id },
                                    { $set: { "configs.points.win": winPoints } }
                                )
                            }

                            if (losePoints) {
                                if (isNaN(losePoints) || losePoints < 0) {
                                    losePoints = null
                                    return interaction.followUp({
                                        embeds: [
                                            new Discord.EmbedBuilder().
                                                setColor('#FF4040').
                                                setDescription('Você não definiu uma quantidade de pontos válida.')]
                                    })
                                }

                                await client.database.guilds.findOneAndUpdate(
                                    { guildID: interaction.guild.id },
                                    { $set: { "configs.points.lose": losePoints } }
                                )
                            }

                            if (mvpPoints) {
                                if (isNaN(mvpPoints) || mvpPoints < 0) {
                                    mvpPoints = null
                                    return interaction.followUp({
                                        embeds: [
                                            new Discord.EmbedBuilder().
                                                setColor('#FF4040').
                                                setDescription('Você não definiu uma quantidade de pontos válida.')]
                                    })
                                }

                                await client.database.guilds.findOneAndUpdate(
                                    { guildID: interaction.guild.id },
                                    { $set: { "configs.points.mvp": mvpPoints } }
                                )
                            }

                            if (consecutiveWins) {
                                if (isNaN(consecutiveWins) || consecutiveWins < 0) {
                                    consecutiveWins = null
                                    return interaction.followUp({
                                        embeds: [
                                            new Discord.EmbedBuilder().
                                                setColor('#FF4040').
                                                setDescription('Você não definiu uma quantidade de vitórias válida.')]
                                    })
                                }

                                await client.database.guilds.findOneAndUpdate(
                                    { guildID: interaction.guild.id },
                                    { $set: { "configs.points.consecutives": consecutiveWins } }
                                )
                            }

                            let embed = new Discord.EmbedBuilder()
                                .setDescription(`Pontuação alterada com sucesso! Confira as mudanças:`)
                                .setColor('#32CD32')

                            if (winPoints) embed.addFields([{ name: `Pontos por Vitória`, value: `${winPoints}` }])
                            if (losePoints) embed.addFields([{ name: `Pontos por Derrota`, value: `${losePoints}` }])
                            if (mvpPoints) embed.addFields([{ name: `Pontos extras para MVP`, value: `${mvpPoints}` }])
                            if (consecutiveWins) embed.addFields([{ name: `Vitórias para vitórias consecutivas`, value: `${consecutiveWins}` }])

                            if (!winPoints && !losePoints && !mvpPoints && !consecutiveWins) embed = new Discord.EmbedBuilder()
                                .setDescription(`Não houve nenhuma mudança nas pontuações!`)
                                .setColor('#FF4040')

                            await attMainMessage(interaction, false);

                            interaction.followUp({ ephemeral: true, embeds: [embed] })
                        })
                    break;
                } // setPoints
            }
        })
    }
}