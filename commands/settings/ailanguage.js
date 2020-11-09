const db = require('quick.db');
const ansAccept = ['en', 'vi'];
module.exports = {
    name: 'ailanguage',
    aliases: ['ailang', 'ngonnguai'],
    description: 'Thay đổi ngôn ngữ AI',
    category: 'settings',
    run: async (client, message, args) => {
        if (!args[0] || !ansAccept.includes(args[0])) return message.channel.send('Vui lòng nhập `en` hoặc `vi` để cài đặt ngôn ngữ!');
        await db.set(`${message.guild.id}.aiLang`, args[0]);
    },
};