const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
module.exports = {
    name: "hitler",
    category: 'images',
    description: 'xuất ra ảnh meme',
    usage: '<PREFIX> hitler [@tag]',
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.hitler(avaurl);
        const attach = new MessageAttachment(image, 'hitler.png');
        return message.channel.send(attach);
    },
};