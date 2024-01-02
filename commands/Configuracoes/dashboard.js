const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
    rank: "everyone",
    name: 'dashboard',
    description: 'Gerencie as configurações do Ganty.',
    options: [],
    async execute(client, interaction, args, back) {
        let configs = [];

        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id });
        if (!interaction.member.permissions.has('Administrator')) {
            if (guildInfos && guildInfos.permissions.commandconfig) {
                if (!interaction.member.roles.cache.find(role => guildInfos.permissions.commandconfig.includes(role.id))) return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            } else {
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder().setColor('#FF4040').setDescription('Você não possui permissão.')] })
            }
        }

        await clearDeletedThings()

        fs.readdir("./commands/Configuracoes/sections/", async (err, files) => {
            if (err) return console.error(err);

            files.forEach(async file => {
                if (!file.endsWith(".js")) return;
                let props = require(`./sections/${file}`);

                if (props.premiumConfig == true && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) return;

                var add = configs.push({
                    label: props.name,
                    description: props.description,
                    value: props.value,
                    emoji: props.emoji
                })
            })
        });

        await client.sleep(500)

        let main;

        if (back) {
            main = await interaction.editReply({
                fetchReply: true,
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Seções")
                        .setColor('#B9D3EE')
                        .setDescription("Olá! Seja bem vindo ao Dashboard do Ganty, aqui você poderá gerenciar todas as configurações relacionadas ao BOT, assim, deixando-o completamente funcional e interativo, do jeito que você preferir.\n\nNo menu rolante abaixo, selecione em qual área do dashboard deseja entrar.")
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('sectionRow')
                                .setPlaceholder('Qual seção você deseja acessar?')
                                .setMaxValues(1)
                                .addOptions(configs)
                        )
                ]
            })
        } else {
            if (interaction) main = await interaction.editReply({
                fetchReply: true,
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Dashboard — Seções")
                        .setColor('#B9D3EE')
                        .setDescription("Olá! Seja bem vindo ao Dashboard do Ganty, aqui você poderá gerenciar todas as configurações relacionadas ao BOT, assim, deixando-o completamente funcional e interativo, do jeito que você preferir.\n\nNo menu rolante abaixo, selecione em qual área do dashboard deseja entrar.")
                        .setFooter({ text: 'Ganty ©' })
                        .setTimestamp()
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('sectionRow')
                                .setPlaceholder('Qual seção você deseja acessar?')
                                .setMaxValues(1)
                                .addOptions(configs)
                        )
                ]
            })
        }

        const intMsg = await interaction.fetchReply()

        const filter = i => i.user.id == interaction.user.id;
        const collector = intMsg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

        collector.on('collect', async i => {
            i.deferUpdate();

            const archive = require(`./sections/${i.values[0]}.js`)
            if (!archive) return main.edit(`Ops, pelo visto ocorreu um erro em nossos sistemas, entre em nosso [servidor de suporte](https://abre.ai/svganty) e reporte esse erro.`)

            archive.execute(client, interaction, args)
        })

        async function clearDeletedThings() {
            if (guildInfos.adv.channel && !interaction.guild.channels.cache.get(guildInfos.adv.channel)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "adv.channel": undefined } }
            )



            if (guildInfos.assinatura.channel && !interaction.guild.channels.cache.get(guildInfos.assinatura.channel)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "assinatura.channel": undefined } }
            )

            if (guildInfos.assinatura.roleFix && !interaction.guild.roles.cache.get(guildInfos.assinatura.roleFix)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "assinatura.roleFix": undefined } }
            )

            if (guildInfos.assinatura.roles) guildInfos.assinatura.roles.forEach(async sign => {
                if (!interaction.guild.roles.cache.get(sign.role)) await client.database.guilds.findOneAndUpdate(
                    { guildID: interaction.guild.id },
                    { $pull: { "assinatura.roles": sign } }
                )
            })


            if (guildInfos.configs.category) {
                if (!interaction.guild.channels.cache.get(guildInfos.configs.category)) await client.database.guilds.findOneAndUpdate(
                    { guildID: interaction.guild.id },
                    { $set: { "configs.category": null } }
                )
            }

            if (guildInfos.configs.commandChannels) guildInfos.configs.commandChannels.forEach(async channel => {
                if (!interaction.guild.channels.cache.get(channel)) await client.database.guilds.findOneAndUpdate(
                    { guildID: interaction.guild.id },
                    { $pull: { "configs.commandChannels": channel } }
                )
            })

            if (guildInfos.configs.filasChannels) guildInfos.configs.filasChannels.forEach(async channel => {
                if (!interaction.guild.channels.cache.get(channel)) await client.database.guilds.findOneAndUpdate(
                    { guildID: interaction.guild.id },
                    { $pull: { "configs.filasChannels": channel } }
                )
            })

            if (guildInfos.configs.voiceChannels) guildInfos.configs.voiceChannels.forEach(async channel => {
                if (!interaction.guild.channels.cache.get(channel)) await client.database.guilds.findOneAndUpdate(
                    { guildID: interaction.guild.id },
                    { $pull: { "configs.voiceChannels": channel } }
                )
            })



            if (guildInfos.logs.roomLogs && !interaction.guild.roles.cache.get(guildInfos.logs.roomLogs)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "logs.roomLogs": undefined } }
            )

            if (guildInfos.logs.commandLogs && !interaction.guild.roles.cache.get(guildInfos.logs.commandLogs)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "logs.commandLogs": undefined } }
            )



            if (guildInfos.ranks) guildInfos.ranks.forEach(async rank => {
                if (!interaction.guild.roles.cache.get(rank.rank)) await client.database.guilds.findOneAndUpdate(
                    { guildID: interaction.guild.id },
                    { $pull: { ranks: rank } }
                )
            })


            if (guildInfos.ticket.category && !interaction.guild.channels.cache.get(guildInfos.ticket.category)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "ticket.category": null } }
            )

            if (guildInfos.ticket.channel && !interaction.guild.channels.cache.get(guildInfos.ticket.channel)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "ticket.channel": null } }
            )

            if (guildInfos.ticket.role && !interaction.guild.roles.cache.get(guildInfos.ticket.role)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "ticket.role": null } }
            )

            if (guildInfos.ticket.logs && !interaction.guild.channels.cache.get(guildInfos.ticket.logs)) await client.database.guilds.findOneAndUpdate(
                { guildID: interaction.guild.id },
                { $set: { "ticket.logs": null } }
            )



            guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
        }
    }
}