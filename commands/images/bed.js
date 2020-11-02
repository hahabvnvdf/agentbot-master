const { Canvas } = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "bed",
    category: 'images',
    description: 'xuất ra meme',
    usage: '<PREFIX>bed [@tag]',
    run: async (client, message, args) => {
        const url1 = message.author.displayAvatarURL({ format: 'png', dynamic: false });
        const nguoitag = args[0] && !isNaN(args[0]) ? message.mentions.members.first() || await message.guild.members.fetch(args[0]) : message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await Canvas.bed(url1, avaurl);
        const attach = new MessageAttachment(image, 'bed.png');
        return message.channel.send(attach);
    },
};