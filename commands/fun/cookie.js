const cookieEmoji = '<a:ancookie:753449823855968408>';
const db = require('quick.db');
const shipDb = new db.table('shipDb');
module.exports = {
    name: 'cookie',
    category: 'fun',
    description: 'Đưa cookie cho ăn nhoàm nhoàm nhoàm',
    usage: '<PREFIX>cookie <@tag>',
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!nguoitag) return message.channel.send('Vui lòng tag 1 ai đó!');
        else if (nguoitag.id == message.author.id) return message.channel.send('Bạn không thể tự cho chính bạn cookie.');
        else {
            let string;
            if (shipDb.has(message.author.id)) {
                const authorData = await shipDb.get(message.author.id);
                if (authorData.target.id == nguoitag.id) {
                    authorData.target.cookie++;
                    await shipDb.set(message.author.id, authorData);
                    string = `Cái cookie ${authorData.target.cookie !== 1 ? `thứ ${authorData.target.cookie}` : 'đầu tiên'} của bạn.`;
                }
            }
            message.channel.send(`${cookieEmoji} | **${nguoitag.user.username}**, bạn đã nhận 1 cookie từ **${message.author.username}**. \n${string ? string : ''}`);
        }
    },
};