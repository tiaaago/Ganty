const Discord = require('discord.js');
const mercadopago = require('mercadopago');
const { AwesomeQR } = require("awesome-qr");
module.exports = {
    rank: "premium",
    name: "assinatura",
    description: "Veja uma assinatura ativa.",
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
        }
    ],
    async execute(client, interaction, args) {
        let guildInfos = await client.database.guilds.findOne({ guildID: interaction.guild.id })
        const userInfos = await client.database.users.findOne({ guildID: interaction.guild.id, userID: interaction.user.id })

        if (guildInfos && !(guildInfos.premium.active && guildInfos.premium.type == "normal")) return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('Este servidor não possui **PREMIUM**. Caso você seja o dono dele, adquira em `/premium buy`.')
                    .setColor('#B22222')
                    .setFooter({ text: 'Ganty ©' })
            ]
        })

        const action = args[0]

        if (action == 'buy') {
            const assinaturas = guildInfos.assinatura.roles.map(sign => sign).filter(sign => sign.role && sign.price && sign.time)
            if (!guildInfos.systems.activated.find(result => result == "gantypay")) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`Este servidor não tem o sistema de pagamentos ativos.`)
                        .setColor('#FF4040')
                ]
            })

            if (assinaturas.length == 0) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`Esse servidor não tem nenhuma assinatura para venda.`)
                        .setColor('#FF4040')
                ]
            })

            if (!guildInfos.assinatura.apiKey) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`Este servidor não tem o sistema de pagamentos configurado.`)
                        .setColor('#FF4040')
                ]
            })

            if (Date.now() < Math.floor(Number(userInfos.signature.finalTime) - Number(432000000))) return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`Você só pode renovar a sua assinatura com 5 dias de antecedência.`)
                        .setColor('#FF4040')
                ]
            })

            let cupom = args[1];
            let cupomInfos = guildInfos.assinatura.cupons.find(c => c.code == cupom)

            if (cupom) {
                if (!cupomInfos) return interaction.followUp('O cupom que você digitou é inválido.')
                if (cupomInfos.type == 'firstBuy' && userInfos.signature.lastSignTime) return interaction.followUp('O cupom só é válido para primeiras compras no servidor.')
                if (cupomInfos.type == 'roleNecessary' && !interaction.guild.roles.cache.has(cupomInfos.onlyRole)) return interaction.followUp(`Esse cupom é exclusivo para membros que possuem o cargo ${interaction.guild.roles.cache.get(cupomInfos.onlyRole)}.`)
                if (cupomInfos.limit != 0 && cupomInfos.uses.length >= cupomInfos.limit) return interaction.followUp('Esse cupom já atingiu o limite de usos.')
                if (cupomInfos.uses.find(use => use == interaction.user.id)) return interaction.followUp('Você já utilizou esse cupom.')
            }

            const signMsg = await interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 2048 }) })
                        .setTitle(`Ganty Pay - Assinaturas - Escolha de Assinatura`)
                        .setDescription(`Seja bem vindo ao Ganty Pay, onde você poderá, independente de outros, comprar assinaturas em um servidor.\n\nNo menu rolante abaixo, escolha qual assinatura você deseja comprar e eu te enviarei via privado o PIX para pagamento.\n\n**Lembrando, caso você não tenha as mensagens diretas abertas, o sistema não será iniciado.** Os dados de pagamento são enviados para seu privado para manter a segurança e confidencialidade, portanto, suas mensagens diretas devem ser abertas.`)
                        .setColor('#553AA7')
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('sectionRow')
                                .setPlaceholder('Selecione a assinatura que você deseja comprar.')
                                .setMaxValues(1)
                                .addOptions([].concat(guildInfos.assinatura.roles.map(sign => {
                                    return { label: `${interaction.guild.roles.cache.get(sign.role).name}`, description: `R$${new Intl.NumberFormat('de-DE').format(sign.price)} - ${sign.time} dias`, value: `${sign.role}-${sign.price}-${sign.time}`, emoji: '991745991252394014' }
                                })))
                        )
                ]
            })

            const filter = i => i.user.id == interaction.user.id;
            const collector = signMsg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

            collector.on('collect', async i => {
                await i.deferUpdate()

                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 2048 }) })
                            .setTitle(`Ganty Pay - Assinaturas - Iniciando Gateway de Pagamento`)
                            .setDescription(`Agora, basta aguardar o nosso gateway de pagamento ser iniciado. **Lembrando, caso você não tenha as mensagens diretas abertas, o sistema não será iniciado.** Os dados de pagamento são enviados para seu privado para manter a segurança e confidencialidade, portanto, suas mensagens diretas devem ser abertas.`)
                            .setColor('#553AA7')
                    ],
                    components: []
                })

                const [role, price, time] = i.values[0].split('-')
                const sign = assinaturas.find(sign => sign.role == role && sign.price == price && sign.time == time)
                const realTime = client.convertTime(`${sign.time}d`)

                mercadopago.configurations.setAccessToken(guildInfos.assinatura.apiKey);

                var payment_data = {
                    transaction_amount: sign.price,
                    description: `Assinatura ${interaction.guild.roles.cache.get(sign.role).name} | ${interaction.user.tag} (${interaction.user.id}) | ${interaction.guild.name}`,
                    payment_method_id: 'pix',
                    payer: {
                        email: "ganty@gegbots.com",
                        identification: {
                            type: 'CPF',
                            number: '08745431183'
                        }
                    },
                    date_of_expiration: new Date(Number(Date.now()) + Number(5 * 60000)).toISOString().replace('Z', '-03:00')
                }

                let pixMsg;

                try {
                    pixMsg = await interaction.user.send(`*Aguarde! Não saia da conversa, carregando sistemas...*`)
                } catch (error) {
                    if (error.message.includes('send')) return interaction.editReply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 2048 }) })
                                .setTitle(`Ganty Pay - Falha no Envio do Pagamento`)
                                .setDescription(`Infelizmente, nosso sistema não conseguiu enviar os dados do pagamento pois você tem as mensagem diretas fechadas.\n\nOs dados de pagamento são enviados para seu privado para manter a segurança e confidencialidade, portanto, suas mensagens diretas devem ser abertas. Caso você ainda tenha interesse em comprar uma assinatura, abra suas mensagens diretas e utilize o comando novamente!`)
                                .setColor('#FF4040')
                        ],
                        components: []
                    })
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
                                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 2048 }) })
                                .setTitle(`Ganty Pay - Pagamento Gerado`)
                                .setDescription(`O seu código para pagamento foi gerado com sucesso! Você deve pagar utilizando o **PIX COPIA E COLA** ou **PIX QR CODE**. Ao pagar, basta aguardar o fim do tempo de pagamento que o sistema irá identificar seu pagamento e te fornecerá sua assinatura no servidor ${interaction.guild.name}.\n\nO tempo para pagamento é **5 minutos**.`)
                                .addFields([
                                    { name: 'PIX - Copia e Cola', value: `${Discord.codeBlock('yaml', `${response.point_of_interaction.transaction_data.qr_code}`)}` }
                                ])
                                .setImage(`attachment://${file.name}`)
                                .setColor('#553AA7')
                                .setTimestamp()
                        ], files: [file]
                    })

                    setTimeout(async () => {
                        const { body } = await mercadopago.get(`/v1/payments/${response.id}`)

                        if (body.status == "approved") {
                            if (guildInfos.assinatura.channel) {
                                client.channels.cache.get(guildInfos.assinatura.channel).send({
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setTitle(`LOG | Assinatura ativada`)
                                            .setDescription(`${interaction.user} comprou uma assinatura de **${sign.time}d**.`)
                                    ]
                                })
                            }

                            if (userInfos.signature.finalTime == null) {
                                await client.database.users.findOneAndUpdate(
                                    { guildID: interaction.guild.id, userID: interaction.user.id },
                                    {
                                        $set: {
                                            "signature.role": sign.role,
                                            "signature.lastSignTime": Date.now(),
                                            "signature.finalTime": Number(Date.now()) + Number(realTime),
                                            "signature.paymentId": response.id
                                        }
                                    }
                                )
                            } else {
                                await client.database.users.findOneAndUpdate(
                                    { guildID: interaction.guild.id, userID: interaction.user.id },
                                    {
                                        $set: {
                                            "signature.role": sign.role,
                                            "signature.lastSignTime": Date.now(),
                                            "signature.paymentId": response.id
                                        },
                                        $inc: {
                                            "signature.finalTime": Number(realTime)
                                        }
                                    }
                                )
                            }

                            interaction.member.roles.add(sign.role)
                            if (guildInfos && guildInfos.assinatura && guildInfos.assinatura.roleFix) interaction.member.roles.add(guildInfos.assinatura.roleFix)

                            pixMsg.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                                        .setTitle(`Ganty Pay - Pagamento Aprovado :)`)
                                        .setDescription(`O seu pagamento foi aprovado com sucesso, aproveite sua compra e até a próxima!`)
                                        .setColor('#32CD32')
                                        .setTimestamp()
                                ]
                            })
                        } else {
                            pixMsg.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                                        .setTitle(`Ganty Pay - Pagamento Expirado :(`)
                                        .setDescription(`Você demorou mais de 5 minutos para pagar, o pagamento foi cancelado.`)
                                        .setColor('#FF4040')
                                        .setTimestamp()
                                ]
                            })
                        }
                    }, 5 * 65000)
                })
            })
        }
    }
}