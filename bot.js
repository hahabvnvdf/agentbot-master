const { Collection, MessageEmbed, Client, MessageAttachment } = require("discord.js");
require("dotenv").config();
const { DBOTGG, TYPE_RUN, TOPGG, SNOWFLAKEAPI, TOKEN, SIMSIMI } = process.env;
const timerEmoji = '<a:timer:714891786274734120>';
const fs = require("fs");
const SQLite = require('better-sqlite3');
const sql = new SQLite('./data.sqlite');
const ms = require('ms');
const cooldown = new Set();
const client = new Client({ disableMentions: "everyone", retryLimit: 5 });
const { timezone, ownerID } = require('./config.json');
const { welcome } = require('./functions/canvasfunction');
const { GiveawaysManager } = require('discord-giveaways');
if (!TYPE_RUN) throw new Error("Chạy lệnh npm run dev hoặc npm run build");
const { log } = require('./functions/log');
const { verifyWord, updateNoiTu, laysodep } = require('./functions/utils');

// load trước ~1mb
require('./assets/json/words_dictionary.json');
// discord.bots.gg api
const axios = require('axios');
const instance = axios.create({
    baseURL: 'https://discord.bots.gg/api/v1/',
    timeout: 10000,
    headers: { "Authorization": DBOTGG },
});

if (TYPE_RUN == 'production') {
    const DBL = require('dblapi.js');
    const dbl = new DBL(TOPGG, client);
    // top.gg API
    dbl.on('error', e => {
        log(e);
    });
}
const db = require('quick.db');
const afkData = new db.table('afkdata');
const commandDb = new db.table('disable');
const giveawayManager = new GiveawaysManager(client, {
    storage: './assets/json/giveaways.json',
    updateCountdownEvery: 10000,
    default: {
        botsCanWin: false,
        embedColor: '#FF0000',
        reaction: '🎉',
    },
});
const cooldowns = new Collection();
client.commands = new Collection();
client.aliases = new Collection();
client.giveawaysManager = giveawayManager;
client.snipes = new Map();
client.categories = fs.readdirSync("./commands/");

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});


client.on("ready", async () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    // change all voice status to default
    const allDb = db.all();
    allDb.forEach(guild => {
        db.set(`${guild.ID}.botdangnoi`, false);
    });
    console.log('Applied new database!');

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
    const guildCount = TYPE_RUN == 'production' ? await getGuildCount() : client.guilds.cache.size;
    // set presence
    client.user.setPresence({
        status: "online",
        activity: {
            name: `Đang phục vụ ${laysodep(guildCount)} servers`,
            type: "PLAYING",
        },
    });
    if (TYPE_RUN == 'production') {
        instance.post(`bots/${client.user.id}/stats`, {
            guildCount: guildCount,
        });
        setInterval(function() {
            client.user.setPresence({
                status: "online",
                activity: {
                    name: `Đang phục vụ ${laysodep(guildCount)} servers`,
                    type: 'PLAYING',
                },
            });
            instance.post(`bots/${client.user.id}/stats`, {
                guildCount: guildCount,
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
    if (message.author.bot && TYPE_RUN !== 'ci') return;
    if (!message.guild) return;
    const guildID = message.guild.id;
    // prefix
    let serverData = await db.get(guildID);
    if (!serverData) serverData = await db.set(message.guild.id, { prefix: TYPE_RUN == 'production' ? "_" : "*", logchannel: null, msgcount: true, defaulttts: null, botdangnoi: false, aiChannel: null, msgChannelOff: [], blacklist: false, aiLang: 'vi', noitu: null, noituStart: false, noituArray: [], maxWords: 1500, noituLastUser: null, rankChannel: 'default' });
    const { msgChannelOff, aiChannel, aiLang, noitu, noituStart, noituArray, maxWords, noituLastUser, rankChannel } = serverData;
    if (!maxWords) await updateNoiTu(message.guild.id);
    if (!msgChannelOff) await db.set(`${message.guild.id}.msgChannelOff`, []);
    const listChannelMsg = await db.get(`${message.guild.id}.msgChannelOff`);
    if (message.guild && db.get(`${message.guild.id}.msgcount`) && !cooldown.has(message.author.id) && !listChannelMsg.includes(message.channel.id)) {
        let userdata = client.getScore.get(message.author.id, message.guild.id);
        if (!userdata) userdata = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, xp: 0, level: 1 };
        if (userdata.level !== 999) {
        const xpAdd = Math.floor(Math.random() * 12);
        const nextlvl = userdata.level * 100;
        if (userdata.xp > nextlvl) {
            userdata.level++;
            userdata.xp = 0;
            const rankUpMsg = `Bạn đã lên cấp **${userdata.level}**!`;
            if (checkMsgPerm(message) && rankChannel == 'default') message.reply(rankUpMsg);
            else if (rankChannel) {
                const channel = message.guild.channels.cache.get(rankChannel);
                channel.reply(rankUpMsg);
            }
        } else userdata.xp += xpAdd;
        client.setScore.run(userdata);
        }
        cooldown.add(message.author.id);
            setTimeout(() => {
                cooldown.delete(message.author.id);
        }, ms('1m'));
    }
    // noitu
    if (isInChannel(message, serverData, noitu)) {
        const query = message.content.toLowerCase();
        if (noituLastUser == message.author.id) return errnoitu(message, 'Bạn đã nối từ trước đó rồi, vui lòng chờ!');
        if (!verifyWord(query) || query.length == 1) return errnoitu(message, `Từ \`${message.content}\` không tồn tại trong từ điển của bot!`);
        if (!noituStart) await db.set(`${guildID}.noituStart`, true);
        else {
            const lastWord = noituArray[noituArray.length - 1];
            const shouldStart = lastWord.slice(-1);
            if (!query.startsWith(shouldStart)) return errnoitu(message, `Từ của bạn phải bắt đầu bằng chữ \`${shouldStart}\`!`);
        }
        if (noituArray.includes(query)) return errnoitu(message, `Từ \`${query}\` đã có người nối từ trước!`);
        await message.react('✅');
        await db.push(`${guildID}.noituArray`, query);
        await db.set(`${guildID}.noituLastUser`, message.author.id);
        if (noituArray.length + 1 > maxWords) {
            const embed = new MessageEmbed()
                .setAuthor('Agent Bot', client.user.avatarURL())
                .setDescription(`Trò chơi kết thúc vì số từ chơi đã vượt giới hạn (${maxWords} từ)\n\nVui lòng nhập từ mới!`)
                .setFooter(`Sử dụng lệnh ${serverData.prefix}}setmaxword để tăng giới hạn.`);
            message.channel.send(embed);
            await updateNoiTu(guildID, maxWords);
        }
        return;
    }
    // ai channel
    if (isInChannel(message, serverData, aiChannel)) {
        let res;
        if (!aiLang || aiLang === 'vi') res = await axios.get(`https://api.simsimi.net/v1/c3c/?text=${encodeURIComponent(message.content)}&lang=vi_VN&key=${SIMSIMI}`);
        else res = await axios.get(`https://api.snowflakedev.xyz/api/chatbot?name=Agent%20Bot&gender=male&user=${message.author.id}&message=${encodeURIComponent(message.content)}`, { headers: { Authorization: SNOWFLAKEAPI } });
        if (!checkMsgPerm(message)) return message.author.send('Mình không có quyền gởi tin nhắn ở server này!').catch(err => console.log(err.message));
        message.channel.send(!aiLang || aiLang === 'vi' ? res.data.messages.response : res.data.message);
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
    if (prefix === null || !message.content.startsWith(prefix)) return;
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

client.on('messageDelete', message => {
    if (message.author.bot) return;
    client.snipes.set(message.channel.id, {
        content: message.content,
        author: message.author,
        image: message.attachments.first() ? message.attachments.first().proxyURL : null,
        ID: message.id,
    });
});

client.on('error', (err) => {
    sendOwner(`Bot lỗi: ${err.message}`);
    log(err);
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

// end console chat
function logging(content) {
    if (TYPE_RUN !== 'production') return;
    const moment = require('moment-timezone');
    log(`${moment.tz(timezone).format("DD/MM/YYYY hh:mm:ss")} || ${content}`);
}

async function reset_afk(id) {
    if (!id) throw new Error('Thiếu ID');
    return await afkData.set(id, { afk: false, loinhan: '' });
}

process.on('exit', (exitCode) => {
    if (TYPE_RUN !== 'production') return console.log('Exiting......');
    sendOwner(`Bot đã thoát với exitCode: ${exitCode}`);
});

async function sendOwner(content) {
    if (!content || TYPE_RUN !== 'production') return;
    const owner = await client.users.fetch(ownerID);
    owner.send(content, { split: true, code: true });
}

function errnoitu(message, string) {
    message.react('❌');
    return message.reply(string);
}

async function getGuildCount() {
    const arr = await client.shard.fetchClientValues('guilds.cache.size');
    return arr.reduce((p, n) => p + n, 0);
}

function isInChannel(message, serverData, channelID) {
    return !message.content.startsWith(serverData.prefix) && message.channel.id == channelID && !message.content.match(/\W/g) && !message.content.includes(' ') && message.content.length != 0 && !message.author.bot;
}

if (TYPE_RUN == 'ci') process.exit();
client.login(TOKEN);
