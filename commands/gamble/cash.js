const eco = require('../../functions/economy');
const { laysodep } = require('../../functions/utils');

module.exports = {
    name: "cash",
    cooldown: 5,
    category: 'gamble',
    aliases: ["balance", "bal"],
    description: "Show tiền!",
    usage: "cash",
    run: async (client, message, args) => {
        const moneyEmoji = client.emojis.cache.find(e => e.name == "money" && e.guild.id == '702981787139309575');
        const money = await eco.fetchMoney(message.author.id);
        message.channel.send(`${moneyEmoji ? moneyEmoji : ''} Bạn đang có **${laysodep(money)}** tiền!`);
    },
};