const db = require('quick.db');
const ss = require('string-similarity');
module.exports = {
    name: 'msgchannel',
    category: 'settings',
    description: 'Tắt/Mở phòng tính điểm rank',
    usage: '<PREFIX>msgchannel <#channel>',
    example: '<PREIFX>msgchannel #welcome',
    run: async (client, message, args, serverData) => {
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply('Bạn cần có quyền MANAGE_GUILD để chạy lệnh này!');
        const { msgChannelOff } = serverData;
        if (!args[0]) {
            if (msgChannelOff.length === 0) return message.channel.send('Server không có phòng nào đang tắt tính exp!');
            const channels = [];
            msgChannelOff.forEach(id => {
                const channel = message.guild.channels.cache.get(id);
                if (channel) channels.push(channel);
            });
            return await message.channel.send(`Những phòng đang tắt tính kinh nghiệm là: ${channels.join(' ')}`);
        }
        let id = args[0];
        if (id.startsWith("<#")) id = id.slice(2, id.length - 1);
        let channel = message.guild.channels.cache.get(id);
        if (isNaN(id)) {
            const listChannel = message.guild.channels.cache.filter(c => c.type == 'text').map(ch => ch.name);
            const channel_name = args.join(' ');
            const matches = ss.findBestMatch(channel_name, listChannel);
            if (matches.bestMatch.rating < 0.6) return message.channel.send(`Không tìm thấy channel tên ${channel_name}`);
            channel = message.guild.channels.cache.find(ch => ch.name == matches.bestMatch.target);
        }
        if (!channel) return message.channel.send('Không tìm thấy channel!');
        // check
        if (msgChannelOff.includes(channel.id)) {
            msgChannelOff.filter(ch => ch !== channel.id);
            await db.set(`${message.guild.id}.msgChannelOff`, msgChannelOff);
            message.channel.send(`✅ Đã bật ${channel} thành channel tính kinh nghiệm!`);
        } else {
            // log to database
            await db.push(`${message.guild.id}.msgChannelOff`, channel.id);
            message.channel.send(`✅ Đã tắt ${channel} trong list channel tính kinh nghiệm!`);
        }
    },
};