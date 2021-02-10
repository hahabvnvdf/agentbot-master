const { set } = require('quick.db');
module.exports = {
    name: 'setmaxword',
    aliases: ['maxword', 'maxwords', 'setmaxwords'],
    description: 'Set số lần nối từ tối đa trong 1 game',
    category: 'noitu',
    usage: '<PREFIX>setmaxword <số>',
    run: async (client, message, args, guildData) => {
        const query = parseInt(args[0]);
        if (!query) return message.reply(`Số từ tối đa hiện tại: ${guildData.maxWords}`);
        if (query < 500) return message.reply('Số lần tối đa không được dưới 500 lần!');
        await set(`${message.guild.id}.maxWords`, query);
        message.channel.send('✅ | Thao tác thành công!');
    },
};