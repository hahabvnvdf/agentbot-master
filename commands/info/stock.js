const { getSymbol } = require('yahoo-stock-api');
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'stock',
    category: 'info',
    description: 'Lấy thông tin cổ phiếu (US)',
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send('Vui lòng nhập mã cổ phiếu cần tra!');
        const { currency, response } = await getSymbol(args[0]);
        const { open, previousClose } = response;
        const embed = new MessageEmbed()
            .setTitle(`Thông tin cổ phiếu ${args[0].toUpperCase()}`)
            .addField('Open: ', open)
            .addField('Previous Close Pirce: ', previousClose)
            .setFooter(`Đơn vị tiền tệ: ${currency}`);
        message.channel.send(embed);
    },
};