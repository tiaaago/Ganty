const Discord = require('discord.js');
const parsems = require('parse-ms');
const { prefix } = require('../config.json')
const fs = require('fs');

module.exports = {
    async execute(client, interaction) {
        let guild = await client.database.guilds.findOne({ guildID: interaction.guild.id })
        let user = await client.database.users.findOne({ guildID: interaction.guild.id, userID: interaction.user.id })
        let clientDb = await client.database.clients.findOne({ clientID: client.user.id })
        let userGlobal = await client.database.globalUsers.findOne({ userID: interaction.user.id })

        if (!guild) {
            await client.database.guilds.create({ guildID: interaction.guild.id })
        }

        if (!user) {
            await client.database.users.create({ guildID: interaction.guild.id, userID: interaction.user.id })
        }

        if (!clientDb) {
            await client.database.clients.create({ clientID: client.user.id })
        }

        if (!userGlobal) {
            await client.database.globalUsers.create({ userID: interaction.user.id })
            userGlobal = await client.database.globalUsers.findOne({ userID: interaction.user.id })
        }

        if (userGlobal.blacklisted.state == true) return interaction.reply({ ephemeral: true, content: `> **BLACKLIST!**\nPoxa, você está na blacklist! Pelo que vi aqui, você andou aprontando e ${userGlobal.blacklisted.finalTime ? `só conseguirá usar meus sistemas <t:${Math.round(Number(userGlobal.blacklisted.finalTime) / 1000)}:R>` : `não conseguirá usar meus sistemas mais`}, hein!\n\n*Caso ache que é um engano e queira recorrer, entre em [meu servidor de suporte](https://abre.ai/svganty) e abra um <#997176626758549565>.*` })

        if (interaction.type == Discord.InteractionType.MessageComponent && interaction.isButton() == true) {
            const buttonFile = require('./interactionTypes/Button.js')
            buttonFile.execute(client, interaction)
        }

        if (interaction.type == Discord.InteractionType.ApplicationCommand && interaction.isCommand() == true) {
            const commandFile = require('./interactionTypes/Command.js')
            commandFile.execute(client, interaction)
        }

        if (interaction.type == Discord.InteractionType.MessageComponent && interaction.isStringSelectMenu() == true) {
            const selectMenuFile = require('./interactionTypes/SelectMenu.js')
            selectMenuFile.execute(client, interaction)
        }
    }
}