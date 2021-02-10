const { Collection, Client } = require("discord.js");
require("dotenv").config();
const { TYPE_RUN, TOKEN } = process.env;
const fs = require("fs");
const client = new Client({ disableMentions: "everyone", retryLimit: 5 });
const { ownerID } = require('./config.json');
const { GiveawaysManager } = require('discord-giveaways');
if (!TYPE_RUN) throw new Error("Chạy lệnh npm run dev hoặc npm run build");

// load trước ~1mb
require('./assets/json/words_dictionary.json');

const giveawayManager = new GiveawaysManager(client, {
    storage: './assets/json/giveaways.json',
    updateCountdownEvery: 10000,
    default: {
        botsCanWin: false,
        embedColor: '#FF0000',
        reaction: '🎉',
    },
});
client.commands = new Collection();
client.aliases = new Collection();
client.giveawaysManager = giveawayManager;
client.snipes = new Map();
client.categories = fs.readdirSync("./commands/");
client.ttsTimeout = new Map();

["command", "event"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

process.on('warning', (warn) => {
    if (warn.message.includes("Missing Permissions")) return;
    console.warn(warn);
    sendOwner(`Warning: ${warn.message}`);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// console chat
const y = process.openStdin();
y.addListener("data", res => {
    const x = res.toString().trim().split(/ +/g);
    const send = x.join(' ');
    if (send.length == 0) return console.log("Kh gởi được tin nhắn trống :)");
    client.channels.cache.get("702983688811708416").send(send);
});


process.on('exit', (exitCode) => {
    if (TYPE_RUN !== 'production') return console.log('Exiting......');
    sendOwner(`Bot đã thoát với exitCode: ${exitCode}`);
});

async function sendOwner(content) {
    if (!content || TYPE_RUN !== 'production') return;
    const owner = await client.users.fetch(ownerID);
    owner.send(content, { split: true, code: true });
}

if (TYPE_RUN == 'ci') process.exit(0);
client.login(TOKEN);
