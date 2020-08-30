const Eco = require('quick.eco');
const eco = new Eco.Manager();
const { MessageEmbed } = require('discord.js');
const { laysodep } = require('../../functions/utils');
module.exports = {
    name: 'moneyleaderboard',
    aliases: ['mleaderboard', 'mlb'],
    description: 'Xem bảng xếp hạng tiền của thế giới',
    category: 'gamble',
    cooldown: 10,
    usage: 'mlb',
    run: async (client, message, args) => {
        const bxh = eco.leaderboard(message.guild.id, { limit: 10, raw: false });
        const userdata = eco.fetchMoney(message.author.id);
        const embed = new MessageEmbed()
            .setAuthor('Bảng xếp hạng tiền')
            .setDescription(`Hạng của bạn: **${userdata.position}**`);
            bxh.forEach(user => {
                const member = client.users.cache.get(user.id);
                embed.addField(`\`${user.position}\`. ${member ? member.tag : 'vodanh#0000'}`, `Tiền: ${laysodep(user.money)} 💸`);
            });
        return message.channel.send(embed);
    },
};