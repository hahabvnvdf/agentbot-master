const { Canvas } = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: 'wanted',
    aliases: ['truyna'],
    category: 'images',
    description: 'Truy nã',
    usage: '<PREFIX>truyna',
    run: async (client, message, args) => {
        const nguoitag = args[0] && !isNaN(args[0]) ? message.mentions.members.first() || await message.guild.members.fetch(args[0]) : message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await Canvas.wanted(avaurl);
        const attach = new MessageAttachment(image, 'wanted.png');
        return message.channel.send(attach);
    },
};