const Discord = require('discord.js')
module.exports = {
    name: 'Ranks',
    description: 'Gerencie os cargos dados com base na quantia de pontos.',
    emoji: '992180963230629928',
    value: 'ranks',
    premiumConfig: false,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Ranks")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de gerenciamento de ranks, aqui você pode - sem muita dificuldade - gerenciar os cargos que serão dados com base na quantia de pontos.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields([
                            { name: 'Ranks', value: `${guildInfos.ranks.length >= 1 ? `${guildInfos.ranks.sort((a, b) => a.points - b.points).map((c, i) => `**${i + 1}.** ${interaction.guild.roles.cache.get(c.rank) ? `${interaction.guild.roles.cache.get(c.rank)}` : `${c.rank}`} | ${c.points} pontos`).join('\n')}` : 'Não definido'}` }
                        ])
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configChannels')
                                .setPlaceholder('Selecione a ação que você deseja executar')
                                .setMinValues(1)
                                .setMaxValues(1)
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
                                        label: 'Adicionar | Cargo de rank',
                                        description: 'Clique aqui para adicionar um cargo de rank.',
                                        value: 'addRoleRank',
                                        emoji: '991443155884965898'
                                    },
                                    {
                                        label: 'Remover | Cargo de rank',
                                        description: 'Clique aqui para retirar um cargo de rank.',
                                        value: 'remRoleRank',
                                        emoji: '991443155884965898'
                                    },
                                ])
                        )
                ]
            })
        }

        await attMainMessage(interaction, false);

        const intMsg = await interaction.fetchReply()
        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter });

        let collectorEnabled = true;

        collector.on('collect', async i => {
            await attMainMessage(interaction, false);
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id });

            switch (i.values[0]) {
                case 'homepage': {
                    if (i.replied != true) await i.deferUpdate()
                    const dashboardHomepage = require('../dashboard.js')

                    collector.stop('back to homepage')
                    dashboardHomepage.execute(client, interaction, args, true)
                    break;
                } // homePage

                case "addRoleRank": {
                    await attMainMessage(interaction, false);

                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos.ranks.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de cargos de ranks. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos.ranks.length >= 15) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de cargos de ranks.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('addRoleRankModal')
                            .setTitle('Dashboard | Ranks')
                            .addComponents(
                                new Discord.ActionRowBuilder().addComponents(
                                    new Discord.TextInputBuilder()
                                        .setCustomId('roleIDInput')
                                        .setLabel("ID do Cargo:")
                                        .setPlaceholder("Digite aqui o ID do canal que você deseja setar.")
                                        .setStyle(Discord.TextInputStyle.Short)
                                        .setRequired(true)
                                ),
                                new Discord.ActionRowBuilder().addComponents(
                                    new Discord.TextInputBuilder()
                                        .setCustomId('pointsInput')
                                        .setLabel("Quantidade de Pontos:")
                                        .setPlaceholder("Digite aqui a quantidade de pontos para ganhar esse cargo.")
                                        .setStyle(Discord.TextInputStyle.Paragraph)
                                        .setRequired(true)
                                ),
                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;

                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let roleID = res.fields.getTextInputValue('roleIDInput');
                            let roleInfos = interaction.guild.roles.cache.get(roleID);

                            let points = Number(res.fields.getTextInputValue('pointsInput'));

                            if (!roleInfos) return interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('O cargo/ID inserido não é de um cargo.')
                                        .setColor('#FF4040')
                                ]
                            })

                            if (guildInfos && guildInfos.ranks.find(rankInfos => rankInfos.rank == roleInfos.id)) return interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('Este cargo já está adicionado.')
                                        .setColor('#FF4040')
                                ]
                            })

                            if (isNaN(points)) return interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder().
                                        setColor('#FF4040').
                                        setDescription('Você não definiu uma quantidade de pontos válida.')]
                            })

                            if (points < 0) return interaction.followUp({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('A quantidade de pontos informada precisa ser maior ou igual a 0.')
                                        .setColor('#FF4040')
                                ]
                            })

                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $push: { ranks: { rank: roleInfos.id, points: points } } }
                            )

                            await attMainMessage(interaction, false);

                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`O cargo ${roleInfos} foi adicionado como um cargo de rank e será conquistado por membros que tiverem ${points} pontos.`)
                                        .setColor('#32CD32')
                                ]
                            })
                        })
                        .catch(async (err) => {
                            if (err.message.includes('time')) {
                                await attMainMessage(interaction, false);
                            }
                        })
                    break;
                } // addRoleRank

                case "remRoleRank": {
                    if (i.replied != true) await i.deferUpdate()
                    await attMainMessage(interaction, false);

                    if (guildInfos && !guildInfos.ranks || guildInfos && guildInfos.ranks.length <= 0) return interaction.followUp({
                        ephemeral: true,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription('Não possui nenhum cargo de rank adicionado.')
                                .setColor('#FF4040')
                        ]
                    })

                    await attMainMessage(interaction, false);

                    let remRoleMenu = [];

                    if (guildInfos && guildInfos.ranks) guildInfos.ranks.forEach(roleID => {
                        if (remRoleMenu.find(menuInfos => menuInfos.value == roleID)) return;
                        remRoleMenu.push({
                            label: interaction.guild.roles.cache.get(roleID.rank) ? interaction.guild.roles.cache.get(roleID.rank).name : 'Cargo deletado',
                            description: `ID: ${roleID.rank}`,
                            value: `${roleID.rank}`,
                            emoji: '<:trash:1008518050313670666>'
                        })
                    })

                    let msgC = await interaction.channel.send({
                        content: `${i.member}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`No menu abaixo, você encontrará a lista de cargos de ranks que estão adicionados até o momento. Selecione todos que deseja remover.`)
                                .setColor('#6C7B8B')
                        ],
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.StringSelectMenuBuilder()
                                        .setCustomId('menuRemRoleRank')
                                        .setPlaceholder('Selecione os canais de comandos que você deseja retirar')
                                        .setMinValues(1)
                                        .setMaxValues(remRoleMenu.length)
                                        .addOptions(remRoleMenu)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = msgC.createMessageComponentCollector({ filter, time: 2 * 60000, max: 1 })

                    collector.on('collect', async i => {
                        i.values.forEach(async value => {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $pull: { ranks: { rank: value } } }
                            )
                        })

                        setTimeout(async () => await await attMainMessage(interaction, false), 1000);

                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(i.values.length > 1 ? `Os cargos com ID a seguir foram retirados dos cargos de ranks:\n*${i.values.join('\n')}*` : `O cargo com ID: *${i.values}* foi retirado dos cargos de ranks.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        msgC.delete()
                        await attMainMessage(interaction, false);
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msgC.delete(); }
                    })
                    break;
                } // remRoleRank
            }
        })
    }
}