const Discord = require('discord.js')
const mercadopago = require('mercadopago')
module.exports = {
    name: 'Fechar Filas',
    description: 'Feche as filas do Ganty.',
    emoji: '948628847488819240',
    value: 'fecharfila',
    premiumConfig: true,
    async execute(client, interaction, args) {

        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Fechamento de Filas")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de fechamento de filas, aqui você pode - sem muita dificuldade - ativar ou desativar a criação de novas filas.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields([
                            { name: 'Filas 1v1', value: `${guildInfos.configs.filasState.v1 ? 'Ativada' : 'Desativada'}` },
                            { name: 'Filas 2v2', value: `${guildInfos.configs.filasState.v2 ? 'Ativada' : 'Desativada'}` },
                            { name: 'Filas 3v3', value: `${guildInfos.configs.filasState.v3 ? 'Ativada' : 'Desativada'}` },
                            { name: 'Filas 4v4', value: `${guildInfos.configs.filasState.v4 ? 'Ativada' : 'Desativada'}` },
                            { name: 'Filas 5v5', value: `${guildInfos.configs.filasState.v5 ? 'Ativada' : 'Desativada'}` },
                        ])
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configFilas')
                                .setPlaceholder('Selecione a ação que você deseja executar')
                                .setMinValues(1)
                                .setMaxValues(5)
                                .setDisabled(disabled)
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
                                        label: '1v1',
                                        value: 'close1v1',
                                        emoji: '<a:fire_gif:935241064699269141>'
                                    },
                                    {
                                        label: '2v2',
                                        value: 'close2v2',
                                        emoji: '<a:fire_gif:935241064699269141>'
                                    },
                                    {
                                        label: '3v3',
                                        value: 'close3v3',
                                        emoji: '<a:fire_gif:935241064699269141>'
                                    },
                                    {
                                        label: '4v4',
                                        value: 'close4v4',
                                        emoji: '<a:fire_gif:935241064699269141>'
                                    },
                                    {
                                        label: '5v5',
                                        value: 'close5v5',
                                        emoji: '<a:fire_gif:935241064699269141>'
                                    }
                                ])
                        )
                ]
            })
        }

        await attMainMessage(interaction, false);

        const intMsg = await interaction.fetchReply()
        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            if (i.replied != true) await i.deferUpdate()
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            i.values.forEach(async iTV => {
                if (iTV == "homepage") {
                    const dashboardHomepage = require('../dashboard.js')

                    collector.stop('back to homepage')
                    return dashboardHomepage.execute(client, interaction, args, true)
                }

                if (iTV == "close1v1") {
                    if (guildInfos.configs.filasState.v1 == null) {
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "configs.filasState.v1": false } }
                        )
                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`As filas **1v1** foram fechadas com sucesso!`)
                                    .setColor('#FF4040')
                            ]
                        })
                    } else {
                        if (guildInfos.configs.filasState.v1 == true) {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v1": false } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **1v1** foram fechadas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        } else {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v1": true } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **1v1** foram abertas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        }
                    }
                }

                if (iTV == "close2v2") {
                    if (guildInfos.configs.filasState.v2 == null) {
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "configs.filasState.v2": false } }
                        )
                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`As filas **2v2** foram fechadas com sucesso!`)
                                    .setColor('#FF4040')
                            ]
                        })
                    } else {
                        if (guildInfos.configs.filasState.v2 == true) {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v2": false } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **2v2** foram fechadas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        } else {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v2": true } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **2v2** foram abertas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        }
                    }
                }

                if (iTV == "close3v3") {
                    if (guildInfos.configs.filasState.v3 == null) {
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "configs.filasState.v3": false } }
                        )
                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`As filas **3v3** foram fechadas com sucesso!`)
                                    .setColor('#FF4040')
                            ]
                        })
                    } else {
                        if (guildInfos.configs.filasState.v3 == true) {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v3": false } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **3v3** foram fechadas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        } else {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v3": true } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **3v3** foram abertas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        }
                    }
                }

                if (iTV == "close4v4") {
                    if (guildInfos.configs.filasState.v4 == null) {
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "configs.filasState.v4": false } }
                        )
                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`As filas **4v4** foram fechadas com sucesso!`)
                                    .setColor('#FF4040')
                            ]
                        })
                    } else {
                        if (guildInfos.configs.filasState.v4 == true) {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v4": false } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **4v4** foram fechadas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        } else {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v4": true } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **4v4** foram abertas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        }
                    }
                }

                if (iTV == "close5v5") {
                    if (guildInfos.configs.filasState.v5 == null) {
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "configs.filasState.v5": false } }
                        )
                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`As filas **5v5** foram fechadas com sucesso!`)
                                    .setColor('#FF4040')
                            ]
                        })
                    } else {
                        if (guildInfos.configs.filasState.v5 == true) {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v5": false } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **5v5** foram fechadas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        } else {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "configs.filasState.v5": true } }
                            )
                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`As filas **5v5** foram abertas com sucesso!`)
                                        .setColor('#FF4040')
                                ]
                            })
                        }
                    }
                }
            })

            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
            await attMainMessage(interaction, false);
        })
    }
}