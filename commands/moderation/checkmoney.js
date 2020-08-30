const Eco = require('quick.eco');
const eco = new Eco.Manager();
const { ownerID } = require('../../config.json');
module.exports = {
    name: 'checkmoney',
    description: 'Kiểm tra tiền (owner bot only)',
    run: async (client, message, args) => {
        if (message.author.id !== ownerID) return message.channel.send('Chỉ có owner của bot mới có thể sử dụng lệnh này');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const data = await eco.fetchMoney(member.id);
        message.channel.send(JSON.stringify(data, null, 4), { code: "json" });
    },
};