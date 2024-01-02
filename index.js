const Discord = require('discord.js')
const client = new Discord.Client({
    intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildPresences],
    partials: [Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.GuildScheduledEvent, Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.Users]
});
const { token } = require('./config.json')
const fs = require('fs')
const mongoose = require('mongoose')

mongoose.connect('INSIRA AQUI SEU LINK DE DATABASE!!!', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Users = require('./schemas/Users.js')
const Guild = require('./schemas/Guild.js')
const Partidas = require('./schemas/Partidas.js')
const Client = require('./schemas/Client.js')
const GlobalUsers = require('./schemas/GlobalUsers.js')
client.database = {
    users: Users,
    guilds: Guild,
    partidas: Partidas,
    clients: Client,
    globalUsers: GlobalUsers
}

client.commands = new Discord.Collection()
client.inQG = [];

client.convertTime = (time) => {
    const timeUnits = time.replace(/[\d\s]/g, _ => '').toLowerCase().split('')
    const formats = ['d', 'h', 'm', 's', 'M', 'y']

    const isValid = timeUnits.length === new Set(timeUnits).size && timeUnits.every((u, i, a) => formats.includes(u) && formats.indexOf(a[i - 1]) < formats.indexOf(u))
    if (!isValid) return null

    const formatted = time.replace(/([a-zA-Z])/g, '$1 ').toLowerCase().trim().split(' ').filter(f => !!f)
    if (formatted.some(e => !/[0-9]/.test(e))) return null

    const invalid = { h: 24, m: 60, s: 60, M: 12 }
    for (const f of formatted) {
        const value = f.replace(/\D/g, '')
        const unit = f.replace(/\d/gi, '')

        if (value >= invalid[unit]) return null
    }

    const convertions = { d: 86_400_000, h: 3_600_000, m: 60_000, s: 1000, y: 31_557_600_000, M: 2_629_800_000 }

    return formatted.reduce((acc, curr, i, a) => acc + parseInt(curr.substring(0, curr.length - 1)) * convertions[curr[curr.length - 1]], 0)
}

client.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fs.readdir("./commands/", (err, folders) => {
    if (err) console.error(err);
    folders.forEach(async folder => {
        fs.readdir(`./commands/${folder}/`, (err, files) => {
            if (err) console.error(err);

            let arquivojs = files.filter(f => f.split(".").pop() === "js");
            arquivojs.forEach((f) => {
                let props = require(`./commands/${folder}/${f}`);
                client.commands.set(props.name, props);
            });
        });
    })
});

fs.readdir("./events/", (err, files) => {
    if (err) console.error(err);
    let arquivojs = files.filter(f => f.split(".").pop() === "js");
    arquivojs.forEach((f) => {
        let props = require(`./events/${f}`);
        client.on(f.replace(".js", ""), (...args) => props.execute(client, ...args));
    });
});

process.on('uncaughtException', console.error);

process.on('unhandledRejection', console.error);

client.login(token);