const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: 'jail',
    category: 'images',
    description: 'Cho vào tù',
    usage: '<PREFIX>jail [@tag]',
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.jail(avaurl);
        const attachment = new MessageAttachment(image, 'jail.png');
        return message.channel.send(attachment);
    },
};