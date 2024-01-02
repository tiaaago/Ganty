const Discord = require('discord.js')
module.exports = {
    name: 'Sistemas',
    description: 'Gerencie os sistemas e comandos do seu servidor.',
    emoji: '993549608527597598',
    value: 'systems',
    premiumConfig: false,
    async execute(client, interaction, args) {
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
                label: 'Sistema | Ranks e atualizador de nicks',
                description: 'Clique aqui para ativar ou desativar o sistema de ranks e atualizador de nicks.',
                value: 'systemRank',
                emoji: '991443155884965898'
            },
            {
                label: 'Sistema | Bloqueio de bots em partidas',
                description: 'Clique aqui para ativar ou desativar o sistema de bloqueio de bots em partidas.',
                value: 'systemNoBots',
                emoji: '991443155884965898'
            }
        ]

        if (guildInfos && (guildInfos.premium.active && guildInfos.premium.type == "normal")) menuOptions.push(
            {
                label: 'Sistema | MVP',
                description: 'Clique aqui para ativar ou desativar o sistema de MVP.',
                value: 'systemMVPs',
                emoji: '991443155884965898'
            }
        )

        const attMainMessage = async (interaction, disabled) => {
            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            let activated = []; let desactivated = []

            if ((guildInfos.premium.active && guildInfos.premium.type == "normal")) {
                activated = guildInfos.systems.activated
                desactivated = guildInfos.systems.desactivated
            } else {
                activated = guildInfos.systems.activated.filter(adc => !['mvp'].includes(adc))
                desactivated = guildInfos.systems.desactivated.filter(adc => !['mvp'].includes(adc))
            }

            activated = activated.join(', ').replace('mvp', 'MVP')
            desactivated = desactivated.join(', ').replace('mvp', 'MVP')

            await interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Sistemas")
                        .setColor('#B9D3EE')
                        .setDescription("Seja bem vindo ao painel de gerenciamento de sistemas, aqui você pode - sem muita dificuldade - gerenciar os sistemas do seu servidor, isto é, ativar ou desativar comandos e funcionalidades que você não quer.\n\nCaso queira alterar algo, basta utilizar o menu ao final desta caixa (embed).\n\n**As configurações atuais são:**")
                        .addFields([
                            { name: 'Sistemas Ativados', value: `${guildInfos && activated.length >= 1 ? `${activated.charAt(0).toUpperCase() + activated.slice(1)}` : 'Nenhum sistema está ativado.'}` },
                            { name: 'Sistemas Destivados', value: `${guildInfos && desactivated.length >= 1 ? `${desactivated.charAt(0).toUpperCase() + desactivated.slice(1)}` : 'Nenhum sistema está desativado.'}` }
                        ])
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('configSystems')
                                .setPlaceholder('Selecione a ação que você deseja executar')
                                .setMaxValues(menuOptions.length)
                                .addOptions(menuOptions)
                                .setDisabled(disabled)
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

            if (i.values.indexOf('homepage') > -1) {
                const dashboardHomepage = require('../dashboard.js')

                collector.stop('back to homepage')
                dashboardHomepage.execute(client, interaction, args, true)
                return;
            }

            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
            let systemsOn = []; let systemsOff = [];

            i.values.forEach(async system => {
                if (system == "systemRank") {
                    if (guildInfos.systems.activated && guildInfos.systems.activated.indexOf('ranks') != -1) {
                        systemsOff.push('ranks e atualizador de nicks')
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $pull: { "systems.activated": 'ranks' }, $push: { "systems.desactivated": 'ranks' } }
                        )
                    } else {
                        systemsOn.push('ranks e atualizador de nicks')
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $push: { "systems.activated": 'ranks' }, $pull: { "systems.desactivated": 'ranks' } }
                        )
                    }
                }

                if (system == "systemMVPs") {
                    if (guildInfos.systems.activated && guildInfos.systems.activated.indexOf('mvp') != -1) {
                        systemsOff.push('MVPs')
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $pull: { "systems.activated": 'mvp' }, $push: { "systems.desactivated": 'mvp' } }
                        )
                    } else {
                        systemsOn.push('MVPs')
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $push: { "systems.activated": 'mvp' }, $pull: { "systems.desactivated": 'mvp' } }
                        )
                    }
                }

                if (system == "systemGantyPay") {
                    if (guildInfos.systems.activated && guildInfos.systems.activated.indexOf('gantypay') != -1) {
                        systemsOff.push('sistema de pagamentos automáticos')

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $pull: { "systems.activated": 'gantypay' }, $push: { "systems.desactivated": 'gantypay' } }
                        )
                    } else {
                        systemsOn.push('sistema de pagamentos automáticos')
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $push: { "systems.activated": 'gantypay' }, $pull: { "systems.desactivated": 'gantypay' } }
                        )
                    }
                }

                if (system == "systemNoBots") {
                    if (guildInfos.systems.activated && guildInfos.systems.activated.indexOf('nobots') != -1) {
                        systemsOff.push('bloqueio de bots em partidas')

                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $pull: { "systems.activated": 'nobots' }, $push: { "systems.desactivated": 'nobots' } }
                        )
                    } else {
                        systemsOn.push('bloqueio de bots em partidas')
                        await client.database.guilds.findOneAndUpdate(
                            { guildID: interaction.guild.id },
                            { $push: { "systems.activated": 'nobots' }, $pull: { "systems.desactivated": 'nobots' } }
                        )
                    }
                }
            })

            await client.sleep(1000)
            await attMainMessage(interaction, false);

            return interaction.followUp({
                embeds: [
                    new Discord.EmbedBuilder()
                        .addFields([
                            { name: 'Sistemas que foram ativados', value: `${systemsOn.length >= 1 ? systemsOn.join(', ').charAt(0).toUpperCase() + systemsOn.join(', ').slice(1) : 'Nenhum sistema foi ativado.'}` },
                            { name: 'Sistemas que foram desativados', value: `${systemsOff.length >= 1 ? systemsOff.join(', ').charAt(0).toUpperCase() + systemsOff.join(', ').slice(1) : 'Nenhum sistema foi desativado.'}` }
                        ])
                        .setColor('#32CD32')
                ]
            })

        })

    }
}