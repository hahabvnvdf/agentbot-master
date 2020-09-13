const ss = require('string-similarity');
const db = require('quick.db');
module.exports = {
    name: 'welcomechannel',
    category: 'settings',
    description: 'Chọn channel để bot nhắn tin nhắn chào mừng',
    usage: '<PREFIX>welcomechannel <#channel hoặc ID>',
    run: async (client, message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.reply('Bạn cần có quyền MANAGE_GUILD để chạy lệnh này.');
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
        // log to database
        await db.set(`${message.guild.id}.welcomechannel`, channel.id);
        message.channel.send(`Thao tác thành công!`);
    },
};