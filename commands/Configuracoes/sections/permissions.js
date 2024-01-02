const Discord = require('discord.js')
module.exports = {
    name: 'Permissões',
    description: 'Gerencie as permissões.',
    emoji: '991746493750968380',
    value: 'permissions',
    premiumConfig: false,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            let menuOptions = [
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
                    label: 'Permissão | Gerenciar filas e salas',
                    value: 'managesystems'
                },
                {
                    label: 'Permissão | Usar comando em qualquer chat',
                    value: 'anychatcommand'
                },
                {
                    label: 'Permissão | Ver os canais de partida',
                    value: 'seeroomschannel'
                },
                {
                    label: 'Comando | Config',
                    value: 'commandconfig'
                },
                {
                    label: 'Comando | Adicionar/remover pontos',
                    value: 'commandaddremovepoints'
                }
            ]

            if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) menuOptions.push(
                {
                    label: 'Comando | Fechar filas',
                    value: 'commandsetupranked'
                },
                {
                    label: 'Comando | Adv',
                    value: 'commandadv'
                },
                {
                    label: 'Comando | Gerarcode/removerassinatura',
                    value: 'commandgerarcoderemassinatura'
                }
            )

            let fieldsArray = [
                { name: 'Permissão: gerenciar filas e salas', value: guildInfos.permissions.managesystems.length >= 1 ? `${guildInfos.permissions.managesystems.map(c => ` ${interaction.guild.roles.cache.get(c)} (${c})`)}` : 'Não definido', inline: false },
                { name: 'Permissão: usar comando em qualquer chat', value: guildInfos.permissions.anychatcommand.length >= 1 ? `${guildInfos.permissions.anychatcommand.map(c => ` ${interaction.guild.roles.cache.get(c)} (${c})`)}` : 'Não definido', inline: false },
                { name: 'Permissão: ver os canais de partida', value: guildInfos.permissions.seeroomschannel.length >= 1 ? `${guildInfos.permissions.seeroomschannel.map(c => ` ${interaction.guild.roles.cache.get(c)} (${c})`)}` : 'Não definido', inline: false },
                { name: 'Comando: config', value: guildInfos.permissions.commandconfig.length >= 1 ? `${guildInfos.permissions.commandconfig.map(c => ` ${interaction.guild.roles.cache.get(c)} (${c})`)}` : 'Não definido', inline: false },
                { name: 'Comando: adicionar/remover pontos', value: guildInfos.permissions.commandaddremovepoints.length >= 1 ? `${guildInfos.permissions.commandaddremovepoints.map(c => ` ${interaction.guild.roles.cache.get(c)} (${c})`)}` : 'Não definido', inline: false },
            ]

            if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) fieldsArray.push(
                { name: 'Comando: fechar filas', value: guildInfos.permissions.commandsetupranked.length >= 1 ? `${guildInfos.permissions.commandsetupranked.map(c => ` ${interaction.guild.roles.cache.get(c)} (${c})`)}` : 'Não definido', inline: false },
                { name: 'Comando: adv', value: guildInfos.permissions.commandadv.length >= 1 ? `${guildInfos.permissions.commandadv.map(c => ` ${interaction.guild.roles.cache.get(c)} (${c})`)}` : 'Não definido', inline: false },
                { name: 'Comando: gerarcode/removerassinatura', value: guildInfos.permissions.commandgerarcoderemassinatura.length >= 1 ? `${guildInfos.permissions.commandgerarcoderemassinatura.map(c => ` ${interaction.guild.roles.cache.get(c)} (${c})`)}` : 'Não definido', inline: false }
            )

            await interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Permissões")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de gerenciamento de permissões, aqui você pode - sem muita dificuldade - gerenciar as permissões de diversos sistemas do Ganty.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields(fieldsArray)
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
                                .addOptions(menuOptions)
                                .setDisabled(disabled)
                        )]
            })
        }

        await attMainMessage(interaction, false);

        const intMsg = await interaction.fetchReply()
        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            await attMainMessage(interaction, false);
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id });

            if (i.values[0] == "homepage") {
                if (i.replied != true) await i.deferUpdate()
                const dashboardHomepage = require('../dashboard.js')

                collector.stop('back to homepage')
                dashboardHomepage.execute(client, interaction, args, true)
                return;
            }

            await i.showModal(
                new Discord.ModalBuilder()
                    .setCustomId('setPermissionsModal')
                    .setTitle('Dashboard | Permissões')
                    .addComponents(
                        new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.TextInputBuilder()
                                    .setCustomId('roleIDInput')
                                    .setLabel("ID do Cargo:")
                                    .setPlaceholder("Digite aqui o ID do cargo que você deseja setar essas assinaturas.")
                                    .setStyle(Discord.TextInputStyle.Paragraph)
                                    .setRequired(true)
                            ),
                    )
            );

            const filter = i => i.user.id == interaction.user.id;

            i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                .then(async res => {
                    if (res.replied != true) await res.deferUpdate()

                    let perm = i.values[0];
                    let permSt;

                    let roleID = res.fields.getTextInputValue('roleIDInput');
                    let roleInfos = interaction.guild.roles.cache.get(roleID);

                    if (!roleInfos) return interaction.followUp({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`${interaction.user}, você não inseriu o ID do cargo.`)
                                .setColor('#FF4040')
                        ]
                    })

                    if (perm == 'managesystems') permSt = 'do uso da ação de fechar filas e salas';
                    if (perm == 'commandconfig') permSt = 'do uso do comando de configuração';
                    if (perm == 'commandaddremovepoints') permSt = 'do uso do comando de adicionar e remover pontos';
                    if (perm == 'commandgerarcoderemassinatura') permSt = 'do uso do comando de gerar e remover assinatura';
                    if (perm == 'commandadv') permSt = 'do uso do comando de dar e retirar advertência';
                    if (perm == 'commandsetupranked') permSt = 'do uso do comando bloquear abertura de filas';
                    if (perm == 'anychatcommand') permSt = 'do uso dos comandos do bot em qualquer canal';
                    if (perm == 'seeroomschannel') permSt = 'de ver os canais de sala';

                    const state = await managePermission(perm, roleInfos.id);
                    await attMainMessage(interaction, false);

                    if (state == "add") {
                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O cargo ${roleInfos} recebeu permissão ${permSt}.`)
                                    .setColor('#32CD32')
                            ]
                        })
                    } else {
                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O cargo ${roleInfos} perdeu permissão ${permSt}.`)
                                    .setColor('#32CD32')
                            ]
                        })
                    }
                })
                .catch(async (err) => {
                    if (err.message.includes('time')) {
                        await attMainMessage(interaction, false);
                    }
                })
        })

        async function managePermission(permission, roleID) {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
            let state;

            if (permission == "managesystems") {
                if (guildInfos && guildInfos.permissions.managesystems && guildInfos.permissions.managesystems.indexOf(roleID) != -1) {
                    state = "remove";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { "permissions.managesystems": roleID } }
                    )
                } else {
                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.managesystems && guildInfos.permissions.managesystems.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.managesystems && guildInfos.permissions.managesystems.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    state = "add";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { "permissions.managesystems": roleID } }
                    )
                }
            }

            if (permission == "commandconfig") {
                if (guildInfos && guildInfos.permissions.commandconfig && guildInfos.permissions.commandconfig.indexOf(roleID) != -1) {
                    state = "remove";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { "permissions.commandconfig": roleID } }
                    )
                } else {

                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandconfig && guildInfos.permissions.commandconfig.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandconfig && guildInfos.permissions.commandconfig.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    state = "add";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { "permissions.commandconfig": roleID } }
                    )
                }
            }

            if (permission == "commandaddremovepoints") {
                if (guildInfos && guildInfos.permissions.commandaddremovepoints && guildInfos.permissions.commandaddremovepoints.indexOf(roleID) != -1) {
                    state = "remove";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { "permissions.commandaddremovepoints": roleID } }
                    )
                } else {
                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandaddremovepoints && guildInfos.permissions.commandaddremovepoints.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandaddremovepoints && guildInfos.permissions.commandaddremovepoints.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    state = "add";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { "permissions.commandaddremovepoints": roleID } }
                    )
                }
            }

            if (permission == "commandgerarcoderemassinatura") {
                if (guildInfos && guildInfos.permissions.commandgerarcoderemassinatura && guildInfos.permissions.commandgerarcoderemassinatura.indexOf(roleID) != -1) {
                    state = "remove";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { "permissions.commandgerarcoderemassinatura": roleID } }
                    )
                } else {
                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandgerarcoderemassinatura && guildInfos.permissions.commandgerarcoderemassinatura.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandgerarcoderemassinatura && guildInfos.permissions.commandgerarcoderemassinatura.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    state = "add";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { "permissions.commandgerarcoderemassinatura": roleID } }
                    )
                }
            }

            if (permission == "commandadv") {
                if (guildInfos && guildInfos.permissions.commandadv && guildInfos.permissions.commandadv.indexOf(roleID) != -1) {
                    state = "remove";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { "permissions.commandadv": roleID } }
                    )
                } else {
                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandadv && guildInfos.permissions.commandadv.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandadv && guildInfos.permissions.commandadv.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    state = "add";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { "permissions.commandadv": roleID } }
                    )
                }
            }

            if (permission == "commandsetupranked") {
                if (guildInfos && guildInfos.permissions.commandsetupranked && guildInfos.permissions.commandsetupranked.indexOf(roleID) != -1) {
                    state = "remove";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { "permissions.commandsetupranked": roleID } }
                    )
                } else {
                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandsetupranked && guildInfos.permissions.commandsetupranked.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.commandsetupranked && guildInfos.permissions.commandsetupranked.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    state = "add";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { "permissions.commandsetupranked": roleID } }
                    )
                }
            }

            if (permission == "anychatcommand") {
                if (guildInfos && guildInfos.permissions.anychatcommand && guildInfos.permissions.anychatcommand.indexOf(roleID) != -1) {
                    state = "remove";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { "permissions.anychatcommand": roleID } }
                    )
                } else {
                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.anychatcommand && guildInfos.permissions.anychatcommand.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.anychatcommand && guildInfos.permissions.anychatcommand.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    state = "add";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { "permissions.anychatcommand": roleID } }
                    )
                }
            }

            if (permission == "seeroomschannel") {
                if (guildInfos && guildInfos.permissions.seeroomschannel && guildInfos.permissions.seeroomschannel.indexOf(roleID) != -1) {
                    state = "remove";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { "permissions.seeroomschannel": roleID } }
                    )
                } else {
                    if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.seeroomschannel && guildInfos.permissions.seeroomschannel.length >= 5) return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas. Aumente o limite com o **PREMIUM**! Adquira com o comando `/premium buy`.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                        if (guildInfos && guildInfos.permissions.seeroomschannel && guildInfos.permissions.seeroomschannel.length >= 10) return interaction.followUp({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de canais de filas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    state = "add";
                    await client.database.guilds.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { "permissions.seeroomschannel": roleID } }
                    )
                }
            }
            return state;
        }
    }
}