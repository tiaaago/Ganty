const Discord = require('discord.js')
module.exports = {
    name: 'Padrões',
    description: 'Gerencie os padrões de mensagens, etc.',
    emoji: '1045383260223569970',
    value: 'padroes',
    premiumConfig: false,
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

        const attMainMessage = async (interaction, disabled) => {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            await interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Padrões")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de gerenciamento de padrões, aqui você pode - sem muita dificuldade - alterar mensagens e textos que ficarão nos canais de partida.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields([
                            { name: 'Mensagem no Canal da Partida', value: `${guildInfos.padroes.msgRoom ? `${guildInfos.padroes.msgRoom}` : 'Não definida'}` },
                            { name: 'Layout de Canais de Partida', value: `${guildInfos.padroes.layoutRoom && guildInfos.padroes.layoutRoom != 1 ? `${guildInfos.padroes.layoutRoom}` : 'Padrão (1)'}` }
                        ])
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ], components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configPadroes')
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
                                        label: 'Definir | Mensagem no Canal da Partida',
                                        description: 'Clique aqui para definir a mensagem no canal da partida.',
                                        emoji: '1045383260223569970',
                                        value: 'setMessageRoom',
                                    },
                                    {
                                        label: 'ㅤ',
                                        value: 'nullOption2',
                                    },
                                    {
                                        label: 'Ver | Layouts',
                                        description: 'Clique aqui para ver os layouts disponíveis.',
                                        emoji: '993549608527597598',
                                        value: 'seeLayouts',
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

                case "setMessageRoom": {
                    await i.showModal(
                        new Discord.ModalBuilder()
                            .setCustomId('setMessageModal')
                            .setTitle('Dashboard | Mensagem no Canal da Partida')
                            .addComponents(
                                new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.TextInputBuilder()
                                            .setCustomId('messageInput')
                                            .setLabel("Mensagem que será enviada:")
                                            .setPlaceholder("Digite aqui a mensagem que será enviada no canal da partida.")
                                            .setStyle(Discord.TextInputStyle.Paragraph)
                                    ),
                            )
                    );

                    const filter = i => i.user.id == interaction.user.id;
                    i.awaitModalSubmit({ filter, time: 30000, errors: ['time'] })
                        .then(async res => {
                            if (res.replied != true) await res.deferUpdate()

                            if (res.fields.getTextInputValue('messageInput').length > 1000) return interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription('A mensagem inserida é grande demais. Tente novamente!')
                                        .setColor('#FF4040')
                                ]
                            })


                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { "padroes.msgRoom": res.fields.getTextInputValue('messageInput') } }
                            )

                            await attMainMessage(interaction, false);

                            interaction.followUp({
                                ephemeral: true,
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setDescription(`Mensagem que será enviada no canal de partida:\n\n${res.fields.getTextInputValue('messageInput')}`)
                                        .setColor('#32CD32')
                                ]
                            })
                        })
                    break;
                } // setMessageRoom

                case "seeLayouts": {
                    await i.deferUpdate()

                    /* LAYOUTS */
                    let layouts = [
                        {
                            textChannel: '💬・room-0001',
                            generalVoiceChannel: '⚪ 0001 - Geral',
                            t1VoiceChannel: '🟢 0001 - T1',
                            t2VoiceChannel: '🔴 0001 - T2'
                        },
                        {
                            textChannel: '💭・room-0001',
                            generalVoiceChannel: '🌴 Geral: 0001',
                            t1VoiceChannel: '🐶 Time 1: 0001',
                            t2VoiceChannel: '🐱 Time 2: 0001'
                        },
                        {
                            textChannel: '🎈・room-0001',
                            generalVoiceChannel: '☁️ Geral・0001',
                            t1VoiceChannel: '🌞 T1・0001',
                            t2VoiceChannel: '🌝 T2・0001'
                        }
                    ]
                    /* LAYOUTS */

                    let currentPage = 0

                    let layoutMsg = await interaction.followUp({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`**Canal de texto:** ${layouts[currentPage].textChannel}\n**Canal de Voz Geral:** ${layouts[currentPage].generalVoiceChannel}\n**Canal do Time 1:** ${layouts[currentPage].t1VoiceChannel}\n**Canal do Time 2:** ${layouts[currentPage].t2VoiceChannel}`)
                                .setColor('#32CD32')
                                .setFooter({ text: `Layout ${currentPage + 1}/${layouts.length}` })
                        ],
                        components: [
                            new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                        .setStyle(Discord.ButtonStyle.Secondary)
                                        .setCustomId('back')
                                        .setLabel('Anterior')
                                        .setEmoji('⬅️')
                                        .setDisabled(false),

                                    new Discord.ButtonBuilder()
                                        .setStyle(Discord.ButtonStyle.Secondary)
                                        .setCustomId('next')
                                        .setLabel(`Próximo`)
                                        .setEmoji('➡️')
                                        .setDisabled(false),

                                    new Discord.ButtonBuilder()
                                        .setStyle(Discord.ButtonStyle.Success)
                                        .setCustomId('select')
                                        .setLabel(`Selecionar`)
                                        .setEmoji('✅')
                                        .setDisabled(false),

                                )
                        ]
                    })

                    const filter = i => i.user.id == interaction.user.id;
                    const collector = layoutMsg.createMessageComponentCollector({ filter, time: 60000 });

                    collector.on('collect', async int => {
                        if (int.replied != true) await int.deferUpdate()

                        switch (int.customId) {
                            case 'back': {
                                if (currentPage > 0) {
                                    currentPage--

                                    layoutMsg.edit({
                                        embeds: [
                                            new Discord.EmbedBuilder()
                                                .setDescription(`**Canal de texto:** ${layouts[currentPage].textChannel}\n**Canal de Voz Geral:** ${layouts[currentPage].generalVoiceChannel}\n**Canal do Time 1:** ${layouts[currentPage].t1VoiceChannel}\n**Canal do Time 2:** ${layouts[currentPage].t2VoiceChannel}`)
                                                .setColor('#32CD32')
                                                .setFooter({ text: `Layout ${currentPage + 1}/${layouts.length}` })
                                        ],
                                    })
                                }
                                break;
                            } // back

                            case 'next': {
                                if (currentPage < layouts.length - 1) {
                                    currentPage++

                                    layoutMsg.edit({
                                        embeds: [
                                            new Discord.EmbedBuilder()
                                                .setDescription(`**Canal de texto:** ${layouts[currentPage].textChannel}\n**Canal de Voz Geral:** ${layouts[currentPage].generalVoiceChannel}\n**Canal do Time 1:** ${layouts[currentPage].t1VoiceChannel}\n**Canal do Time 2:** ${layouts[currentPage].t2VoiceChannel}`)
                                                .setColor('#32CD32')
                                                .setFooter({ text: `Layout ${currentPage + 1}/${layouts.length}` })
                                        ],
                                    })
                                }
                                break;
                            } // next

                            case 'select': {
                                await layoutMsg.delete()

                                await client.database.guilds.findOneAndUpdate(
                                    { guildID: interaction.guild.id },
                                    { $set: { "padroes.layoutRoom": currentPage + 1 } }
                                )

                                await attMainMessage(interaction, false);

                                interaction.followUp({
                                    ephemeral: true,
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setDescription(`O layout ${currentPage + 1} foi definido como o padrão de canais de partida.`)
                                            .setColor('#32CD32')
                                    ]
                                })
                                break;
                            } // select
                        }
                    })
                    break;
                } // seeLayouts
            }
        })
    }
}
