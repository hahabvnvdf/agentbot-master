const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "bed",
    category: 'images',
    description: 'xuất ra meme',
    usage: '<PREFIX>bed [@tag]',
    run: async (client, message, args) => {
        const url1 = message.author.displayAvatarURL({ format: 'png', dynamic: false });
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.bed(url1, avaurl);
        const attach = new MessageAttachment(image, 'bed.png');
        return message.channel.send(attach);
    },
};