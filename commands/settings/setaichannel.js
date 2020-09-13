const ss = require('string-similarity');
const db = require('quick.db');
module.exports = {
    name: 'setaichannel',
    category: 'settings',
    aliases: ['aichannel', 'ai'],
    description: 'Set channel cho bot AI nói chuyện',
    note: 'English only',
    usage: '<PREFIX>setaichannel <#channel>',
    run: async (client, message, args) => {
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply('Bạn cần có quyền MANAGE_GUILD để chạy lệnh này.');
        if (!args[0]) return message.channel.send("Vui lòng nhập channel!");
        let id = args[0];
        if (id.startsWith("<#")) id = id.slice(2, id.length - 1);
        let channel = message.guild.channels.cache.get(id);
        if (isNaN(id)) {
            const listChannel = message.guild.channels.cache.filter(c => c.type == 'text').map(ch => ch.name);
            const channelName = args.join(' ');
            const matches = ss.findBestMatch(channelName, listChannel);
            if (matches.bestMatch.rating < 0.6) return message.channel.send(`Không tìm thấy channel tên ${channelName}`);
            channel = message.guild.channels.cache.find(ch => ch.name == matches.bestMatch.target);
        }
        if (!channel) return message.channel.send('Không tìm thấy channel!');
        // check in db
        const guildData = await db.get(message.guild.id);
        const aiChannelID = guildData.aiChannel;
        if (aiChannelID == channel.id) {
            await db.set(`${message.guild.id}.aiChannel`, null);
            message.channel.send(`Đã xoá ${channel}!`);
        } else {
            // log to database
            await db.set(`${message.guild.id}.aiChannel`, channel.id);
            message.channel.send(`Đã lưu ${channel} vào AI channel!`);
        }
    },
};