const Eco = require('quick.eco');
const eco = new Eco.Manager();
module.exports = {
    name: 'checkmoney',
    description: 'Kiểm tra tiền (owner bot only)',
    run: async (client, message, args) => {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        let data = await eco.fetchMoney(member.id);
        message.channel.send(JSON.stringify(data, null, 4), { code: "json" });
    }
}