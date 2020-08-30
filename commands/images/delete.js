const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "delete",
    aliases: ["del"],
    category: "images",
    description: "Delete meme",
    usage: "delete [@tag]",
    example: "delete @phamleduy04",
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.delete(avaurl);
        const attach = new MessageAttachment(image, 'delete.png');
        return message.channel.send(attach);
    },
};