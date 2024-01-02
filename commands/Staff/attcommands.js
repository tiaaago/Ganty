const Discord = require('discord.js')
const fs = require('fs')

module.exports = {
    rank: "dev",
    name: "attcommands",
    description: "Atualizar os slash commands do Ganty.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'reload',
            description: 'Recarregar os comandos e eventos do BOT.'
        },
        {
            type: Discord.ApplicationCommandOptionType.Subcommand,
            name: 'slash',
            description: 'Atualizar os comandos slash, tanto globalmente quanto localmente.'
        },
    ],
    async execute(client, interaction, args) {
        const action = args[0];

        if (action == "slash") {
            const commands = client.commands.map(cmd => ({ name: cmd?.name, description: cmd?.description, options: cmd?.options, rank: cmd?.rank }))
            const devGuilds = ["972930558210478162"]
            const staffGuilds = ["869976036274765834"]
            const premiumGuilds = await client.database.guilds.find({ "premium.active": true })

            // Global commands
            client.commands.set(commands.filter(cmd => cmd.rank == "everyone").map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options })))

            // Dev, Staff ou Premium commands
            client.guilds.cache.forEach(async guild => {
                if (devGuilds.find(guildID => guildID == guild.id) || staffGuilds.find(guildID => guildID == guild.id) || premiumGuilds.find(guildDb => guildDb.guildID == guild.id)) {
                    let commandsArray = [];

                    commands.forEach(cmd => {
                        if (cmd.rank == "dev" && devGuilds.find(guildID => guildID == guild.id)) commandsArray.push({ name: cmd.name, description: cmd.description, options: cmd.options })

                        if (cmd.rank == "staff" && staffGuilds.find(guildID => guildID == guild.id)) commandsArray.push({ name: cmd.name, description: cmd.description, options: cmd.options })

                        if (cmd.rank == "premium" && premiumGuilds.find(guildDb => guildDb.guildID == guild.id)) commandsArray.push({ name: cmd.name, description: cmd.description, options: cmd.options })
                    })

                    guild.commands.set(commandsArray)
                } else return;
            })

            interaction.editReply(`Os slash commands foram setados com sucesso.`)
        } else if (action == "reload") {
            fs.readdir("./commands/", (err, folders) => {
                if (err) return console.error(err);
                client.commands = new Discord.Collection();

                folders.forEach(folder => {
                    fs.readdir(`./commands/${folder}/`, (err, files) => {
                        if (err) return console.error(err);

                        files.forEach(file => {
                            if (!file.endsWith(".js")) return;
                            let props = require(`../${folder}/${file}`);

                            delete require.cache[require.resolve(`../${folder}/${file}`)];
                            client.commands.set(props.name, props);
                        });
                    });
                })
            });

            interaction.editReply(`Os comandos foram recarregados com sucesso.`)
        }
    }
}