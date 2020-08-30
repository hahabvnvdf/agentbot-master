const { MessageEmbed } = require('discord.js');
module.exports = {
    name: "askgoogle",
    category: "fun",
    description: "Trả về link của letmegooglethat",
    run: async (client, message, args) => {
        if (message.deletable) await message.delete();
        if (!args[0]) return message.reply('Nhập gì đó đi bạn');
        const question = encodeURIComponent(args.join(' '));
        const link = `http://letmegooglethat.com/?q=${question}`;
        const embed = new MessageEmbed()
            .setTitle('Câu trả lời của bạn đây')
            .setURL(link)
            .setFooter('Click vào link ở trên');
        message.channel.send(embed);
    },
};