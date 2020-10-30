const eco = require('../../functions/economy');
const { laysodep } = require('../../functions/utils');
module.exports = {
    name: 'give',
    category: 'gamble',
    aliases: ['transfer'],
    description: 'Chuyển tiền cho người khác!',
    usage: '<PREFIX>give <@tag or ID> <so tien>',
    example: '<PREFIX>give @phamleduy04 50000',
    run: async (client, message, args) => {
        const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        if (!member) return message.channel.send('Hãy tag hoặc đưa ID của người đó!');
        if (member.user.bot) return message.channel.send('Bạn không thể gởi tiền cho bot!');
        const amount = await eco.fetchMoney(message.author.id);
        if (message.author.id == member.id) return message.channel.send('Bạn không thể tự chuyển tiền cho chính mình!');
        const soTienChuyen = parseInt(args[1]);
        if (!soTienChuyen) return message.channel.send('Hãy nhập số tiền cần chuyển.');
        if (amount < soTienChuyen) return message.channel.send('Bạn không đủ tiền để chuyển');
        await eco.addMoney(member.id, soTienChuyen);
        await eco.subtractMoney(message.author.id, soTienChuyen);
        return message.channel.send(`Bạn đã chuyển thành công **${laysodep(soTienChuyen)}** tiền tới **${member.user.tag}**.`);
    },
};