const Discord = require('discord.js')
const mercadopago = require('mercadopago')
module.exports = {
    name: 'Assinatura',
    description: 'Gerencie as assinaturas.',
    emoji: '991831855882064043',
    value: 'assinatura',
    premiumConfig: true,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Assinatura")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de gerenciamento de assinatura, aqui você pode - sem muita dificuldade - gerenciar o canal e cargos de assinatura.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields([
                            { name: `Canal de Assinatura`, value: `${guildInfos.assinatura.channel ? `<#${guildInfos.assinatura.channel}>` : 'Nenhum canal definido.'}` },
                            { name: `Cargo de Assinatura Fixo`, value: `${guildInfos.assinatura.roleFix ? `<@&${guildInfos.assinatura.roleFix}>` : 'Nenhum cargo definido.'}` },
                            { name: `Cargos de Assinatura`, value: guildInfos.assinatura.roles.length >= 1 ? `${guildInfos.assinatura.roles.map((c, i = 0) => `**ID ${i + 1}** | ${interaction.guild.roles.cache.get(c.role)} (${c.role}) | R$${new Intl.NumberFormat('de-DE').format(c.price)} | ${c.time} dias`).join('\n')}` : 'Nenhum cargo definido' },
                            { name: `Cupons ativos`, value: `${guildInfos.assinatura.cupons.length >= 1 ? `${guildInfos.assinatura.cupons.map((c, i) => `**${i + 1}.** ${c.code} | ${c.discount} | <t:${Math.round(Number(c.expiresAt) / Number(1000))}:d> | ${Number(c.limit) == 0 ? 'Usos ilimitados' : `${Number(c.limit)} usos`}`).join('\n')}` : `Nenhum cupom foi criado ainda.`}` },
                        ])
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configSignature')
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
                                        label: 'Configurar | Canal de assinaturas',
                                        description: 'Clique aqui para definir o canal de assinaturas.',
                                        value: 'setChannel',
                                        emoji: '991832823268917301'
                                    },
                                    {
                                        label: 'Configurar | Cargo de assinatura fixo',
                                        description: 'Clique aqui para definir o cargo fixo de assinaturas.',
                                        value: 'setRoleFix',
                                        emoji: '991832823268917301'
                                    },
                                    {
                                        label: 'ㅤ',
                                        value: 'nullOption2',
                                    },
                                    {
                                        label: 'Adicionar | Cargo de assinatura',
                                        description: 'Clique aqui para adicionar um cargo de assinatura.',
                                        value: 'addRole',
                                        emoji: '991831855882064043'
                                    },
                                    {
                                        label: 'Remover | Cargo de assinatura',
                                        description: 'Clique aqui para retirar um cargo de assinatura.',
                                        value: 'remRole',
                                        emoji: '991831855882064043'
                                    },
                                ]),
                        )
                ]
            })
        }

        await attMainMessage(interaction, false);

        const intMsg = await interaction.fetchReply()
        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id });
            await attMainMessage(interaction, false);

            switch (i.values[0]) {
                case 'homepage': {
                    if (i.replied != true) await i.deferUpdate()
                    const dashboardHomepage = require('../dashboard.js')

                    collector.stop('back to homepage')
                    dashboardHomepage.execute(client, interaction, args, true)
                    break;
                } // homePage
                case "setChannel": {
                    await i.deferReply()

                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, o canal que você deseja setar.`,
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ChannelSelectMenuBuilder()
                                        .setChannelTypes(Discord.ChannelType.GuildText)
                                        .setCustomId('channelMenu')
                                        .setPlaceholder(`Selecione o canal desejado`)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = selectMessage.createMessageComponentCollector({ filter, time: 30000 })

                    collector.on('collect', async int => {
                        selectMessage.delete()

                        const channelInfos = interaction.guild.channels.cache.get(int.values[0])

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "assinatura.channel": channelInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O canal ${channelInfos} foi definido como o canal de assinatura.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    })
                    break;
                } // setChannel
                case "setRoleFix": {
                    await i.deferReply()

                    const selectMessage = await i.editReply({
                        content: `Selecione abaixo, o cargo que você deseja setar.`,
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.RoleSelectMenuBuilder()
                                        .setCustomId('roleMenu')
                                        .setPlaceholder(`Selecione o cargo desejado`)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = selectMessage.createMessageComponentCollector({ filter, time: 30000 })

                    collector.on('collect', async int => {
                        selectMessage.delete()

                        const roleInfos = interaction.guild.roles.cache.get(int.values[0])

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $set: { "assinatura.roleFix": roleInfos.id } }
                        )

                        i.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O cargo ${roleInfos} foi definido como o cargo de assinatura fixo.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        attMainMessage(interaction, false);
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { attMainMessage(interaction, false); selectMessage.delete() }
                    })
                    break;
                } // setRoleFix

                case "addRole": {
                    if (guildInfos.assinatura.roles.length >= 15) {
                        if (i.replied != true) await i.deferUpdate()
                        return interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription('Este servidor já atingiu o limite de cargos de assinaturas.')
                                    .setColor('#FF4040')
                            ]
                        })
                    }

                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('addRoleModal')
                            .setTitle('Dashboard | Assinatura')
                            .addComponents(
                                new Discord.ActionRowBuilder().addComponents(
                                    new Discord.TextInputBuilder()
                                        .setCustomId('roleIDInput')
                                        .setLabel("ID do Cargo:")
                                        .setPlaceholder("Digite aqui o ID do cargo que você deseja setar.")
                                        .setStyle(Discord.TextInputStyle.Short)
                                        .setRequired(true)
                                ),
                                new Discord.ActionRowBuilder().addComponents(
                                    new Discord.TextInputBuilder()
                                        .setCustomId('timeInput')
                                        .setLabel("Tempo:")
                                        .setPlaceholder("Digite aqui o tempo (em dias) que você deseja que o cargo tenha.")
                                        .setStyle(Discord.TextInputStyle.Short)
                                        .setRequired(true)
                                ),
                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;

                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            let roleID = res.fields.getTextInputValue('roleIDInput');
                            const roleInfos = interaction.guild.roles.cache.get(roleID);

                            let time = Number(res.fields.getTextInputValue('timeInput'));

                            if (!roleInfos) return interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('O cargo/ID inserido não é de um cargo.')
                                        .setColor('#FF4040')
                                ]
                            })

                            if (isNaN(time)) return interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('O tempo inserido não é um número.')
                                        .setColor('#FF4040')
                                ]
                            })

                            if (time < 1) return interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('A quantidade de dias inserida precisa ser maior do que 0.')
                                        .setColor('#FF4040')
                                ]
                            })

                            if (guildInfos.assinatura.roles.find(sign => sign.role == roleInfos.id && sign.time == time)) return interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('Esse cargo já foi setado com o mesmo valor e o mesmo tempo.')
                                        .setColor('#FF4040')
                                ]
                            })

                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $push: { "assinatura.roles": { time: time, role: `${roleInfos.id}` } } }
                            )

                            await attMainMessage(interaction, false);

                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`O cargo ${roleInfos} foi adicionado com sucesso.`)
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
                } // addRole

                case "remRole": {
                    if (i.replied != true) await i.deferUpdate()
                    await attMainMessage(interaction, false);

                    if (guildInfos && !guildInfos.assinatura.roles || guildInfos && guildInfos.assinatura.roles.length <= 0) return interaction.followUp({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription('Não possui nenhum cargo de assinatura adicionado.')
                                .setColor('#FF4040')
                        ]
                    })

                    await attMainMessage(interaction, false);

                    let remRoleMenu = [];

                    if (guildInfos && guildInfos.assinatura.roles) guildInfos.assinatura.roles.forEach(signature => {
                        remRoleMenu.push({
                            label: interaction.guild.roles.cache.get(signature.role) ? interaction.guild.roles.cache.get(signature.role).name : 'Cargo deletado',
                            description: `ID: ${signature.role} | Tempo: ${signature.time}d`,
                            value: `${signature.role}-${signature.time}`,
                            emoji: '<:trash:1008518050313670666>'
                        })
                    })

                    let msgC = await interaction.channel.send({
                        content: `${i.member}`,
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`No menu abaixo, você encontrará a lista de cargos de assinatura que estão adicionados até o momento. Selecione todos que deseja remover.`)
                                .setColor('#6C7B8B')
                        ],
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.StringSelectMenuBuilder()
                                        .setCustomId('menuRemCommandChannel')
                                        .setPlaceholder('Selecione os canais de comandos que você deseja retirar')
                                        .setMinValues(1)
                                        .setMaxValues(1)
                                        .addOptions(remRoleMenu)
                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = msgC.createMessageComponentCollector({ filter, time: 2 * 60000, max: 1 });

                    collector.on('collect', async i => {
                        let value = i.values[0]
                        const [role, time] = value.split('-')

                        const signInfos = guildInfos.assinatura.roles.find(sign => sign.role == role && sign.time == time);

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $pull: { "assinatura.roles": signInfos } }
                        )

                        await attMainMessage(interaction, false)

                        interaction.followUp({
                            ephemeral: true,
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O cargo com *${role} (${time}d)* foi retirado dos cargos de assinatura.`)
                                    .setColor('#32CD32')
                            ]
                        })

                        msgC.delete();
                    })

                    collector.on('end', async (collected, reason) => {
                        if (reason == "time") { await attMainMessage(interaction, false); msgC.delete(); }
                    })
                    break;
                } // remRole
            }
        })
    }
}