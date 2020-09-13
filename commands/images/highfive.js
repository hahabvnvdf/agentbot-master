const { readFileSync, readdirSync } = require('fs');
const { MessageAttachment, MessageEmbed } = require('discord.js');
module.exports = {
    name: 'highfive',
    aliases: ['high5'],
    description: 'Đập tay :)',
    usage: '<PREFIX> high5 <@tag, id>',
    example: '<PREFIX> high5 @phamleduy04',
    run: async (client, message, args) => {
        const emoji = client.emojis.cache.get('741039423080366090') || '🙏';
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (nguoitag.length == 0) return message.reply('Tag ai đó đi bạn ơi :(');
        if (nguoitag.user.id == message.author.id) return message.channel.send('Bạn không thể tự đập tay chính mình.');
        const folder = readdirSync('././assets/highfive/');
        const file = readFileSync(`././assets/highfive/${folder[Math.floor(Math.random() * folder.length)]}`);
        const attachment = new MessageAttachment(file, 'highfive.gif');
        const embed = new MessageEmbed()
            .attachFiles(attachment)
            .setImage('attachment://highfive.gif')
            .setDescription(`${message.member} đã đập tay với ${nguoitag} ${emoji}`);
        message.channel.send(embed);
    },
};