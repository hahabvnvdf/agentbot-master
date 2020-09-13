const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "trash",
    category: "images",
    description: "Bỏ vào thùng rác",
    usage: "<PREFIX>trash [@tag]",
    example: "<PREFIX>trash @phamleduy04",
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.trash(avaurl);
        const attach = new MessageAttachment(image, 'trash.png');
        return message.channel.send(attach);
    },
};