const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "tat",
    aliases: ["tats", "tát"],
    category: "images",
    description: "Tát (batslap)",
    usage: "tat [@tag]",
    example: "tat @phamleduy04",
    run: async (client, message, args) => {
        const url1 = message.author.displayAvatarURL({ format: 'png', dynamic: false });
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.batslap(url1, avaurl);
        const attach = new MessageAttachment(image, 'batslap.png');
        return message.channel.send(attach);
    },
};