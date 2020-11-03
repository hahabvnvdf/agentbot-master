const eco = require('../../functions/economy');
const { ownerID } = require('../../config.json');
const { laysodep } = require('../../functions/utils');
module.exports = {
    name: 'checkmoney',
    aliases: ['cmoney'],
    description: 'Kiểm tra tiền (owner bot only)',
    run: async (client, message, args) => {
        if (message.author.id !== ownerID) return message.channel.send('Chỉ có owner của bot mới có thể sử dụng lệnh này');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const amount = await eco.fetchMoney(member.id);
        message.channel.send(`\`${laysodep(amount)}\``);
    },
};