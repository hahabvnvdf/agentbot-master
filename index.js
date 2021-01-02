const { Collection, MessageEmbed, Client, MessageAttachment } = require("discord.js");
const { config } = require("dotenv");
config({
    path: __dirname + "/.env",
});
const timerEmoji = '<a:timer:714891786274734120>';
const fs = require("fs");
const SQLite = require('better-sqlite3');
const sql = new SQLite('./data.sqlite');
const ms = require('ms');
const cooldown = new Set();
const client = new Client({ disableMentions: "everyone", retryLimit: 5 });
const { timezone, ownerID } = require('./config.json');
const { BID, BRAINKEY } = process.env;
const { welcome } = require('./functions/canvasfunction');
if (!process.env.TYPE_RUN) throw new Error("Chạy lệnh npm run dev hoặc npm run build");
const { log } = require('./functions/log');

// discord.bots.gg api
const axios = require('axios');
const instance = axios.create({
    baseURL: 'https://discord.bots.gg/api/v1/',
    timeout: 10000,
    headers: { "Authorization": process.env.DBOTGG },
});

if (process.env.TYPE_RUN == 'production') {
    const DBL = require('dblapi.js');
    const dbl = new DBL(process.env.TOPGG, client);
    // top.gg API
    dbl.on('error', e => {
        log(e);
    });
}
const db = require('quick.db');
const afkData = new db.table('afkdata');
const commandDb = new db.table('disable');
client.commands = new Collection();
client.aliases = new Collection();
const cooldowns = new Collection();

client.categories = fs.readdirSync("./commands/");

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    // change all voice status to default
    /*
    db.all().forEach(async guild => {
        await db.set(`${guild.ID}.botdangnoi`, false);
    });
    */
    // database
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'xpdata';").get();
    if (!table['count(*)']) {
      // If the table isn't there, create it and setup the database correctly.
      sql.prepare("CREATE TABLE xpdata (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER);").run();
      // Ensure that the "id" row is always unique and indexed.
      sql.prepare("CREATE UNIQUE INDEX idx_xpdata_id ON xpdata (id);").run();
      sql.pragma("synchronous = 1");
      sql.pragma("journal_mode = wal");
    }

    // And then we have two prepared statements to get and set the score data.
    client.getScore = sql.prepare("SELECT * FROM xpdata WHERE user = ? AND guild = ?");
    client.setScore = sql.prepare("INSERT OR REPLACE INTO xpdata (id, user, guild, xp, level) VALUES (@id, @user, @guild, @xp, @level);");
    // set presence
    client.user.setPresence({
        status: "online",
        activity: {
            name: `Đang phục vụ ${client.guilds.cache.size} servers`,
            type: "PLAYING",
        },
    });
    if (process.env.TYPE_RUN == 'production') {
        instance.post(`bots/${client.user.id}/stats`, {
            guildCount: client.guilds.cache.size,
        });
        setInterval(function() {
            client.user.setPresence({
                status: "online",
                activity: {
                    name: `Đang phục vụ ${client.guilds.cache.size} servers`,
                    type: 'PLAYING',
                },
            });
            instance.post(`bots/${client.user.id}/stats`, {
                guildCount: client.guilds.cache.size,
            });
        }, 36e5);
    }
});

client.on("guildCreate", async newguild => {
    const owner = await newguild.members.fetch(newguild.ownerID);
    await newguild.members.fetch();
    const embed = new MessageEmbed()
        .setTitle("New Server Joined")
        .addField('Guild Name: ', newguild.name, true)
        .addField('Guild ID: ', newguild.id, true)
        .addField("Guild members: ", newguild.memberCount, true)
        .addField("Owner server: ", owner.user.tag, true)
        .setFooter(`OwnerID: ${newguild.ownerID}`);
    client.channels.cache.get('700071755146068099').send(embed);
    // agent's server
});

client.on("guildDelete", async oldguild => {
    const embed = new MessageEmbed()
        .setTitle("Bot left the server!")
        .addField('Guild Name: ', oldguild.name, true)
        .addField('Guild ID: ', oldguild.id, true)
        .addField('Guild members: ', oldguild.memberCount, true)
        .setFooter(`OwnerID: ${oldguild.ownerID}`);
    client.channels.cache.get('700071755146068099').send(embed);
    // agent's server
});

client.on('guildMemberAdd', async member => {
    const serverdata = db.get(member.guild.id);
    if (!db.has(`${member.guild.id}.welcomechannel`)) return;
    const channel = member.guild.channels.cache.get(serverdata.welcomechannel);
    if (!channel) return;
    const image = await welcome(member.user.username, member.user.discriminator, member.user.displayAvatarURL({ format: 'png', dynamic: false }), member.guild.memberCount);
    const attachment = new MessageAttachment(image, 'welcome.png');
    return channel.send(attachment);
});

client.on("message", async message => {
    if (message.author.bot && process.env.TYPE_RUN !== 'ci') return;
    if (!message.guild) return;
    // prefix
    let serverData = await db.get(message.guild.id);
    if (!serverData) {
        serverData = await db.set(message.guild.id, { prefix: "_", logchannel: null, msgcount: true, defaulttts: null, botdangnoi: false, aiChannel: null, msgChannelOff: [], blacklist: false, aiLang: 'vi' });
    }
    const { msgChannelOff, aiChannel, aiLang } = serverData;
    if (!msgChannelOff) await db.set(`${message.guild.id}.msgChannelOff`, []);
    const listChannelMsg = await db.get(`${message.guild.id}.msgChannelOff`);
    if (message.guild && db.get(`${message.guild.id}.msgcount`) && !cooldown.has(message.author.id) && !listChannelMsg.includes(message.channel.id)) {
        let userdata = client.getScore.get(message.author.id, message.guild.id);
        if (!userdata) userdata = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, xp: 0, level: 1 };
        if (userdata.level !== 999) {
        const xpAdd = Math.floor(Math.random() * 12);
        const nextlvl = userdata.level * 100;
        if(userdata.xp > nextlvl) {
            userdata.level++;
            userdata.xp = 0;
            if (checkMsgPerm(message)) message.reply(`Bạn đã lên cấp **${userdata.level}**!`);
        } else userdata.xp += xpAdd;
        client.setScore.run(userdata);
        }
        cooldown.add(message.author.id);
            setTimeout(() => {
                cooldown.delete(message.author.id);
        }, ms('1m'));
    }
    // ai channel
    if (message.channel.id == aiChannel && !message.author.bot) {
        let url;
        if (!aiLang || aiLang === 'vi') url = `https://api.simsimi.net/v1/?text=${encodeURIComponent(message.content)}&lang=vi_VN`;
        else url = `http://api.brainshop.ai/get?bid=${BID}&key=${BRAINKEY}&uid=1&msg=${encodeURIComponent(message.content)}`;
        const res = await axios.get(url);
        if (!checkMsgPerm(message)) return message.author.send('Mình không có quyền gởi tin nhắn ở server này!').catch(err => console.log(`${message.author.id} không mở DMs`));
        message.channel.send(!aiLang || aiLang === 'vi' ? res.data.messages[0].response : res.data.cnt);
    }
    // check unafk
    let checkAFK = await afkData.get(message.author.id);
    if (!checkAFK) checkAFK = await reset_afk(message.author.id);
    if (checkAFK.afk === true) {
        await reset_afk(message.author.id);
        message.reply('Bạn không còn AFK nữa!');
    }
    const mention = message.mentions.members.array();
    if (mention.length !== 0) {
    mention.forEach(async member => {
        let userAFK = await afkData.get(member.id);
        if (!userAFK) userAFK = await reset_afk(member.id);
        if (userAFK.afk === true) message.channel.send(`${member.user.username} đã AFK, lời nhắn: ${userAFK.loinhan}`);
    });
    }
    const prefixlist = [`<@${client.user.id}>`, `<@!${client.user.id}>`, serverData.prefix];
    let prefix = null;
    for (const thisprefix of prefixlist) {
        if (message.content.toLowerCase().startsWith(thisprefix)) prefix = thisprefix;
    }
    if (prefix === null) return;
    if (!message.content.startsWith(prefix)) return;
    const blacklist_status = await db.get(`${message.guild.id}.blacklist`);
    if (!blacklist_status) await db.set(`${message.guild.id}.blacklist`, false);
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) {
        if (!checkMsgPerm(message)) return message.author.send('Mình không có quyền gởi tin nhắn ở server này!').catch(err => console.log(`${message.author.id} không mở DMs`));
        if (command.ownerOnly === true && message.author.id !== ownerID) return message.channel.send('Lệnh này chỉ dành cho Owner của bot!');
        let guildCheck = await commandDb.get(message.guild.id);
        if (!guildCheck) guildCheck = await commandDb.set(message.guild.id, []);
        if (guildCheck.includes(command.name)) return message.channel.send('Lệnh này đã bị tắt ở server này!');
        if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
        if (timestamps.has(message.author.id) && message.author.id !== ownerID) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`${timerEmoji} Vui lòng đợi thêm \`${timeLeft.toFixed(1)} giây\` để có thể sử dụng lệnh này.`);
            }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        if (blacklist_status === true && command.name !== 'blacklist') return message.channel.send('Server bạn đang nằm trong blacklist, vui lòng liên hệ owner của bot hoặc vào support server tại: https://top.gg/bot/645883401500622848');
        logging(`${message.author.tag} || ${command.name} || ${message.guild.name}(${message.guild.id})`);
        command.run(client, message, args, serverData);
    }
});

function checkMsgPerm(message) {
    const botPerms = message.channel.permissionsFor(client.user);
    if (!botPerms) return true;
    return botPerms.has(['SEND_MESSAGES']);
}

client.on('voiceStateUpdate', (oldstate, newstate) => {
    if (oldstate.member.id !== client.user.id) return;
    if (newstate.channelID == null) {
        db.set(`${oldstate.guild.id}.botdangnoi`, false);
        db.delete(`${oldstate.guild.id}.endtime`);
    }
});

client.on('error', (err) => {
    sendOwner(`Bot lỗi: ${err.message}`);
    log(err);
});

process.on('warning', (warn) => {
    if (warn.message.includes("Missing Permissions") || warn.message.includes("Unhandled promise rejection")) return;
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

// end console chat
function logging(content) {
    if (process.env.TYPE_RUN !== 'production') return;
    const moment = require('moment-timezone');
    log(`${moment.tz(timezone).format("DD/MM/YYYY hh:mm:ss")} || ${content}`);
}

async function reset_afk(id) {
    if (!id) throw new Error('Thiếu ID');
    return await afkData.set(id, { afk: false, loinhan: '' });
}

process.on('exit', (exitCode) => {
    if (process.env.TYPE_RUN !== 'production') return console.log('Exiting......');
    sendOwner(`Bot đã thoát với exitCode: ${exitCode}`);
});

async function sendOwner(content) {
    if (!content || process.env.TYPE_RUN !== 'production') return;
    const owner = await client.users.fetch(ownerID);
    owner.send(content, { split: true, code: true });
}

if (process.env.TYPE_RUN == 'ci') process.exit();
client.login(process.env.TOKEN);
