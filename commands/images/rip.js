const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "rip",
    category: "images",
    description: "Cho vào ảnh bia mộ =))",
    usage: "rip [@tag]",
    example: "rip @phamleduy04",
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.rip(avaurl);
        const attach = new MessageAttachment(image, 'rip.png');
        return message.channel.send(attach);
    },
};