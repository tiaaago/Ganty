const Discord = require('discord.js');
module.exports = {
    rank: "dev", 
    name: "gercupom",
    description: "Gerar um cupom para compra de premium no GantyPay.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Adicionar um cupom ao sistema.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: 'cupom',
                    description: 'Insira aqui o cupom que você deseja criar.',
                    required: true,
                },
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: 'percentage',
                    description: 'Insira aqui a porcentagem de desconto do cupom.',
                    required: true,
                },
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: 'time',
                    description: 'Insira aqui a quantidade de dias que o cupom irá durar.',
                    required: true,
                },
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: 'limit',
                    description: 'Insira aqui a quantidade de usos máxima do cupom.',
                    required: true,
                },
            ]
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remover um cupom do sistema.',
            options: [
                {
                    type: Discord.ApplicationCommandOptionType.String,
                    name: 'cupom',
                    description: 'Insira aqui o cupom que você deseja remover.',
                    required: true,
                },
            ]
        },
    ],
    async execute(client, interaction, args) {
        if (!['852610866683445328', '776576976630055033'].includes(interaction.member.id)) return;
        let clientInfos = await client.database.clients.findOne({ clientID: client.user.id })

        let acao = args[0]
        if (!acao) return interaction.reply('Você não definiu a ação. \`g!addpremium <add/remove>\`')
        if (!['add', 'remove'].includes(acao)) return interaction.reply('Você não definiu a ação corretamente. \`g!addpremium <add/remove>\`')

        if (acao == 'add') {
            const cupom = args[1];
            const percentage = args[2];
            const time = args[3];
            const limit = args[4];

            if (!cupom) return interaction.reply('Você não definiu o cupom. \`g!addpremium add <cupom> <porcentagem> <tempo> <limite de usos>\`')
            if (!percentage) return interaction.reply('Você não definiu o preço. \`g!addpremium add <cupom> <porcentagem> <tempo> <limite de usos>\`')
            if (!time) return interaction.reply('Você não definiu o tempo. \`g!addpremium add <cupom> <porcentagem> <tempo> <limite de usos>\`')
            if (!limit) return interaction.reply('Você não definiu o limite de usos. \`g!addpremium add <cupom> <porcentagem> <tempo> <limite de usos>\`')

            const searchCupom = clientInfos.cupons.find(c => c.code == cupom)

            if (searchCupom) {
                if (searchCupom.expiresAt > Date.now()) return interaction.reply('Este cupom já existe e está ativo.')

                if (searchCupom.expiresAt < Date.now() || (searchCupom.uses === Number && searchCupom.uses >= searchCupom.limit)) {
                    await client.database.clients.findOneAndUpdate(
                        { clientID: client.user.id },
                        { $pull: { cupons: searchCupom } }
                    )

                    clientInfos = await client.database.clients.findOne({ clientID: client.user.id })
                }
            }

            await client.database.clients.findOneAndUpdate(
                { clientID: client.user.id },
                { $push: { cupons: { code: cupom, discount: Number(percentage), expiresAt: Date.now() + client.convertTime(time), limit: limit, uses: [] } } }
            )

            interaction.reply('Cupom adicionado com sucesso.')
        } else if(acao == 'remove') {
            const cupom = args[1];

            if (!cupom) return interaction.reply('Você não definiu o cupom. \`g!addpremium remove <cupom>\`')

            const searchCupom = clientInfos.cupons.find(c => c.code == cupom)

            if (!searchCupom) return interaction.reply('Este cupom não existe.')

            await client.database.clients.findOneAndUpdate(
                { clientID: client.user.id },
                { $pull: { cupons: searchCupom } }
            )

            interaction.reply('Cupom removido com sucesso.')
        }
    }
}