const eco = require('../../functions/economy');
const { MessageEmbed } = require('discord.js');
const { laysodep } = require('../../functions/utils');
module.exports = {
    name: 'moneyleaderboard',
    aliases: ['mleaderboard', 'mlb'],
    description: 'Xem bảng xếp hạng tiền',
    category: 'gamble',
    cooldown: 10,
    usage: 'mlb',
    run: async (client, message, _) => {
        const bxh = await eco.leaderBoard(10, client, message, '💵');
        const members = message.guild.members.cache.map(m => m.id);
        let num = 0;
        const embed = new MessageEmbed()
            .setTitle(`Bảng xếp hạng của server ${message.guild.name}`);
        for (let i = 0; i < bxh.length; i++) {
            const idList = bxh[i];
            const ids = idList.ID.split('_')[1];
            if (!members.includes(ids)) continue;
            num++;
            embed.addField(`${num}. ${client.users.cache.get(ids).tag}`, `Tiền: ${laysodep(idList.data)} 💸`);
            if (num > 9) break;
            // 10 nguoi
        }
        return message.channel.send(embed);
    },
};
