const { MessageAttachment } = require('discord.js');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./data.sqlite');
const fs = require('fs');
const random_num = require('random-number-csprng');
const db = require('quick.db');
const canvacord = require('canvacord');
module.exports = {
    name: "rank",
    category: "ranking",
    description: "Check rank",
    usage: "<PREFIX>rank [@tag]",
    example: "<PREFIX>rank @phamleduy04",
    note: "Max level là 999",
    cooldown: 15,
    run: async (client, message, args) => {
      const serverStatus = db.get(`${message.guild.id}.msgcount`);
      if (serverStatus === false) return message.channel.send('Server không bật hệ thống rank!');
      const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'xpdata';").get();
      if (!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE xpdata (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER);").run();
        // Ensure that the "id" row is always unique and indexed.
        sql.prepare("CREATE UNIQUE INDEX idx_xpdata_id ON xpdata (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
      }
      const insert = sql.prepare("SELECT * FROM xpdata WHERE user = ? AND guild = ?");
      const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
      if (member.user.bot) return message.reply('Bạn không thể xem rank của bot!');
      const data = insert.get(member.user.id, message.guild.id);
      const server_data = sql.prepare("SELECT * FROM xpdata WHERE guild = ? ORDER BY level DESC, xp DESC;").all(message.guild.id);
      let rank = server_data.findIndex(userdata => userdata.user == member.user.id);
      if (rank == -1) return message.reply('Người bạn tìm không có rank!');
      rank++;
      const rankImage = new canvacord.Rank()
        .registerFonts()
        .setAvatar(member.user.displayAvatarURL({ format: 'png' }))
        .setCurrentXP(data.xp)
        .setRequiredXP(data.level * 300)
        .setLevel(data.level)
        .setRank(rank)
        .setStatus(member.user.presence.status)
        .setProgressBar("#FFFFFF", "COLOR")
        .setUsername(member.user.username)
        .setDiscriminator(member.user.discriminator);
      if (fs.existsSync(`././assets/userbackground/${member.id}.jpg`))
        rankImage.setBackground('IMAGE', fs.readFileSync(`././assets/userbackground/${member.id}.jpg`));
      const card = await rankImage.build();
      const attachment = new MessageAttachment(card, "rank.png");
      const random = await random_num(0, 100);
      message.channel.send(random < 20 ? `Nếu bạn muốn có background custom, hãy vào support server!` : `Rank của bạn **${member.user.username}**`, attachment);
    },
};