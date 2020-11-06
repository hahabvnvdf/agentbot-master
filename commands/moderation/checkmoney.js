const eco = require('../../functions/economy');
const { laysodep } = require('../../functions/utils');
module.exports = {
    name: 'checkmoney',
    aliases: ['cmoney'],
    description: 'Kiểm tra tiền của người khác',
    ownerOnly: true,
    run: async (client, message, args) => {
        const member = message.mentions.members.first() || message.member;
        const amount = await eco.fetchMoney(member.id);
        message.channel.send(`\`${laysodep(amount)}\``);
    },
};