const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "gay",
    category: "images",
    description: "Cho 7 màu vào avt =))",
    usage: "<PREFIX>gay [@tag]",
    example: "<PREFIX>gay @phamleduy04",
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.gay(avaurl);
        const attach = new MessageAttachment(image, 'gay.png');
        return message.channel.send(attach);
    },
};