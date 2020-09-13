const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: 'wanted',
    aliases: ['truyna'],
    category: 'images',
    description: 'Truy nã',
    usage: '<PREFIX>truyna',
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.wanted(avaurl);
        const attach = new MessageAttachment(image, 'wanted.png');
        return message.channel.send(attach);
    },
};