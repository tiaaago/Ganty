const Discord = require('discord.js');
const { AwesomeQR } = require("awesome-qr");
const fs = require("fs");
const mercadopago = require("mercadopago");

module.exports = {
    rank: "everyone",
    name: "premium",
    description: "Gerencie a assinatura premium do servidor.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'buy',
            description: 'Compre assinatura premium para um de seus servidores.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: 'cupom',
                    description: 'Caso você tenha, insira aqui um cupom de desconto.',
                    required: false
                }
            ]
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'time',
            description: 'Consulte o tempo de premium que esse tervidor possui.'
        }
    ],
    async execute(client, interaction, args) {
        return interaction.editReply(`**O comando de premium foi desativado pelos desenvolvedores.**`)
        const action = args[0]

        if (action == 'buy') {
            let price = 25
            let time = '2629800000'
            const product = "1 mês de premium"
            let cupom = args[1];
            let clientInfos = await client.database.clients.findOne({ clientID: client.user.id })
            let gantyGuild = client.guilds.cache.get('869976036274765834')
            let gantyGuildAuthorMember = gantyGuild?.members.cache.get(interaction.user.id)
            let cupomInfos = clientInfos.cupons.find(c => c.code == cupom)
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            if (cupom) {
                if (!cupomInfos) return interaction.editReply('O cupom que você digitou é inválido.')
                if (cupomInfos.onlySquad == true && gantyGuildAuthorMember && !gantyGuildAuthorMember.roles.cache.has('1001190639003770911')) return interaction.editReply('**Esse cupom é exclusivo para membros do Ganty Squad!** <a:target_gif:991443295848898670>\nPara entrar no Ganty Squad e poder utilizar o cupom, entre em meu [servidor de suporte](<https://discord.gg/ganty>), vá até o canal <#1001190349257064608> e reaja no emoji indicado.')
                if (cupomInfos.limit === Number && cupomInfos.uses.length >= cupomInfos.limit) return interaction.editReply('Esse cupom já atingiu o limite de usos.')
                if (cupomInfos.uses.find(use => use == interaction.user.id)) return interaction.editReply('Você já utilizou esse cupom.')
            }

            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`Você não tem permissão para comprar assinatura premium.`)
                        .setColor('#FF4040')
                ]
            })

            interaction.editReply({
                content: 'Seu pedido foi iniciado com sucesso, as instruções foram enviadas em seu privado.',
                embeds: []
            })

            mercadopago.configurations.setAccessToken('APP_USR-7411741841766575-070923-08670bb6acce89bb1f5c29c52ad41e78-252171086');

            var payment_data = {
                transaction_amount: cupom ? Number(price - (cupomInfos && cupomInfos.discount ? cupomInfos.discount * price / 100 : 0)) : Number(price),
                description: `${product} | ${interaction.user.tag} (${interaction.user.id}) - ${interaction.guild.name}`,
                payment_method_id: 'pix',
                payer: {
                    email: "gaelhps01@gmail.com",
                    identification: {
                        type: 'CPF',
                        number: '81721129391'
                    }
                },
                date_of_expiration: new Date(Number(Date.now()) + Number(5 * 60000)).toISOString().replace('Z', '-03:00')
            }

            let pixMsg;

            try {
                pixMsg = await interaction.user.send(`*Aguarde! Não saia da conversa, carregando sistemas...*`)
            } catch (error) {
                if (error.message.includes('send')) return interaction.editReply(`O seu privado está bloqueado, libere-o e tente novamente.`)
            }

            mercadopago.payment.create(payment_data).then(async function (data) {
                const { response } = data;

                const buffer = await new AwesomeQR({
                    text: response.point_of_interaction.transaction_data.qr_code,
                    size: 500,
                }).draw();

                let file = new Discord.AttachmentBuilder(buffer, { name: 'qr.png' });

                pixMsg.edit({
                    content: 'Pagamento gerado!',
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                            .setTitle(`Ganty Pay - Premium - Pix Gerado`)
                            .setDescription(`O seu código para pagamento foi gerado com sucesso! Você deve pagar utilizando o **PIX COPIA E COLA** ou **PIX QR CODE**. Ao pagar, basta aguardar o fim do tempo de pagamento que o sistema irá identificar seu pagamento e te fornecerá seu **${product}**.\n\nO tempo para pagamento é **5 minutos**.`)
                            .addFields([
                                { name: `PIX - Copia e Cola:`, value: `\`\`\`${response.point_of_interaction.transaction_data.qr_code}\`\`\`` },
                            ])
                            .setColor('#3BEE57')
                            .setTimestamp()
                    ],
                    files: [file]
                })

                setTimeout(async () => {
                    const { body } = await mercadopago.get(`/v1/payments/${response.id}`)

                    if (body.status == "approved") {
                        await client.database.clients.findOneAndUpdate(
                            { clientID: client.user.id },
                            { $push: { "cupons.$[cupom].uses": interaction.user.id } },
                            { arrayFilters: [{ "cupom.code": cupom }] }
                        )

                        client.guilds.cache.get('972930558210478162').channels.cache.get('992075670710649005').send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`O usuário ${interaction.user} (${interaction.user.id}) adquiriu **PREMIUM** para o servidor ${interaction.guild.name} (${interaction.guild.id}).`)
                                    .setColor('#FF8C00')
                            ]
                        })

                        guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

                        if (!guildInfos.premium.active || guildInfos.premium.type == "booster") {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                {
                                    $set: {
                                        'premium.active': true,
                                        'premium.type': 'normal',
                                        'premium.finalTime': Number(Date.now()) + Number(time),
                                        'premium.lastBuyTime': Date.now(),
                                        'premium.paymentId': response.id
                                    }
                                }
                            )

                            let gantyGuildOwnerMember = gantyGuild.members.cache.get(interaction.guild.ownerId)

                            if (gantyGuildOwnerMember) gantyGuildOwnerMember.roles.add('995921304614080585')

                            let commands = client.commands.map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options, rank: cmd.rank }));

                            if (interaction.guild.id == '972930558210478162') {
                                commands = commands.filter(cmd => cmd.rank == "premium" || cmd.rank == "dev").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
                                interaction.guild.commands.set(commands);
                            } else {
                                commands = commands.filter(cmd => cmd.rank == "premium").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
                                interaction.guild.commands.set(commands);
                            }
                        } else {
                            await client.database.guilds.findOneAndUpdate(
                                { guildID: interaction.guild.id },
                                { $set: { 'premium.lastBuyTime': Date.now(), 'premium.paymentId': response.id }, $inc: { 'premium.finalTime': Number(time) } }
                            )
                        }

                        pixMsg.reply({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                                    .setTitle(`Ganty Pay - Premium - Pagamento Aprovado`)
                                    .setDescription(`O seu pagamento foi aprovado com sucesso, aproveite sua compra e até a próxima!`)
                                    .setColor('#3BEE57')
                                    .setTimestamp()
                            ]
                        })
                    } else {
                        pixMsg.reply({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                                    .setTitle(`Ganty Pay - Premium - Pagamento Expirado`)
                                    .setDescription(`Você demorou mais de 5 minutos para pagar, o pagamento foi cancelado.`)
                                    .setColor('#3BEE57')
                                    .setTimestamp()
                            ]
                        })
                    }
                }, 5 * 65000)
            })
        } else if (action == 'time') {
            let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })

            if (guildInfos && (guildInfos.premium.active)) {
                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription(`Tempo de ${guildInfos.premium.type == "normal" ? "PREMIUM" : "BOOSTER"}: <t:${Math.floor(Number(guildInfos.premium.finalTime) / Number(1000))}:R>`)
                            .setColor('#32CD32')
                    ]
                })
            } else {
                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription('Seu servidor não possui PREMIUM.')
                            .setColor('#FF4040')
                    ]
                })
            }
        }

    }
}