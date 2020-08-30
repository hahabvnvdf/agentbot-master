const { MessageEmbed } = require("discord.js");
const axios = require("axios");
module.exports = {
    name: "hug",
    category: "images",
    description: "Ôm ai đó hoặc tất cả",
    usage: "hug [@tag]",
    example: "hug (ôm tất cả) hoặc hug @phamleduy04",
    run: async (client, message, args) => {
        const nguoitag = message.mentions.members.array() || message.guild.members.cache.get(args[0]);
        try {
            const embed = new MessageEmbed();
            const response = await axios.get('https://some-random-api.ml/animu/hug');
            if (nguoitag.length == 0) embed.setDescription(`${message.member} đã ôm tất cả mọi người <3`);
            else embed.setDescription(`Awwww, ${message.member} đã ôm ${nguoitag} <3`);
            embed.setImage(response.data.link);
            return message.channel.send(embed);
        }
        catch(e) {
            console.log(e);
            return message.channel.send("Bot lỗi khi cố gắng lấy hình, hãy thử lại sau");
        }
    },
};