const Discord = require('discord.js');
const fs = require('fs');
const discordTranscripts = require('discord-html-transcripts');
module.exports = {
    async execute(client, interaction) {
        if (interaction.customId == 'openTicket') {
            await interaction.deferUpdate()

            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            if (guildInfos && !guildInfos.ticket.category || !guildInfos.ticket.role) return interaction.channel.send({
                content: `${interaction.member}`,
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription('Hm... Não é possível utilizar o ticket pois a categoria de ticket ou o cargo de atendentes não foi configurado!')
                        .setColor('#FF4040')
                ]
            }).then(msg => setTimeout(() => { msg.delete() }, 5000))

            if (interaction.guild.channels.cache.find(channel => channel.name == `ticket-${interaction.user.username.toLowerCase().replaceAll('.', '').replaceAll(' ', '-')}`)) {
                await interaction.channel.send(`${interaction.user}, você já possui um ticket aberto!`).then(msg => setTimeout(() => { msg.delete() }, 5000))
            } else {
                let tChannel = await interaction.guild.channels.create({ name: `ticket-${interaction.user.username}`, topic: `${interaction.user.id}`, type: Discord.ChannelType.GuildText, parent: guildInfos.ticket.category })

                await tChannel.permissionOverwrites.create(interaction.user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
                await tChannel.permissionOverwrites.create(interaction.guildId, { ViewChannel: false });
                await tChannel.permissionOverwrites.create(guildInfos.ticket.role, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });

                let st = await tChannel.send({ content: `<@&${guildInfos.ticket.role}>`, embeds: [new Discord.EmbedBuilder().setTitle('📫 | Ticket').setDescription(`Seja bem-vindo! Envie o motivo do seu ticket aqui, detalhe ele ao máximo para que nossa equipe não fique confusa, ok?! Quando o canal puder ser deletado, avise!`).setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 4096 })).setColor('#8DEEEE')], components: [new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder().setStyle(Discord.ButtonStyle.Danger).setCustomId('closeTicket').setLabel('Fechar').setEmoji('<:error:1001849788846846002>').setDisabled(false))] })
                await st.pin()

                await tChannel.send(`${interaction.user}`).then(msg => setTimeout(() => { msg.delete() }, 500))
                await interaction.channel.send(`${interaction.user}, ticket aberto: ${tChannel}!`).then(msg => setTimeout(() => { msg.delete() }, 5000))
            }
            return;
        } // openTicket

        if (interaction.customId == 'closeTicket') {
            await interaction.deferUpdate()

            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && !interaction.member.roles.cache.has(guildInfos.ticket.role)) return;
            interaction.editReply({ components: [new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder().setStyle(Discord.ButtonStyle.Danger).setCustomId('closeTicket').setLabel('Fechar').setEmoji('<:error:1001849788846846002>').setDisabled(true))] })

            const attachment = await discordTranscripts.createTranscript(interaction.channel);

            if (guildInfos.premium.active && guildInfos.ticket.logs) {
                client.channels.cache.get(guildInfos.ticket.logs).send({
                    embeds: [
                        {
                            title: `TICKET — Atendimento Finalizado`,
                            description: `Um novo ticket foi encerrado e os logs de mensagens estão sendo enviados aqui, para ver as transcrições, basta baixar o arquivo desta mensagem e abri-lo no navegador. Mais informações sobre o atendimento podem ser encontradas abaixo.`,
                            color: 0x553AA7,
                            fields: [
                                {
                                    name: `Staff`,
                                    value: `${interaction.member}`
                                },
                                {
                                    name: `Usuário`,
                                    value: `${client.users.cache.get(interaction.channel.topic)}`
                                },
                                {
                                    name: `Canal de Atendimento`,
                                    value: `${interaction.channel} (${interaction.channel.id})`
                                }
                            ],
                            footer: {
                                text: `Ganty ©`
                            },
                            timestamp: new Date()
                        }
                    ],
                    files: [attachment],
                });

            }

            if (interaction.channel) interaction.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`${interaction.user} fechou o ticket! Este canal será deletado em 10 segundos...`)
                        .setColor('#32CD32')
                ]
            })

            setTimeout(() => {
                if (interaction.channel) interaction.channel.delete()
            }, 10000);
            return;
        } // closeTicket
    }
}