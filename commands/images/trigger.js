const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "trigger",
    category: "images",
    description: "Triggererrreerere",
    usage: "<PREFIX>trigger [@tag]",
    example: "<PREFIX>trigger @phamleduy04",
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.trigger(avaurl);
        const attach = new MessageAttachment(image, 'trigger.gif');
        return message.channel.send(attach);
    },
};