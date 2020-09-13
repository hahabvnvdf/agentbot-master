const { KSoftClient } = require('ksoft.js');
const { MessageEmbed } = require('discord.js');
const ksoft_key = process.env.KSOFTKEY;
const ksoft = new KSoftClient(ksoft_key);

module.exports = {
    name: "lyrics",
    aliases: ["lyric"],
    category: "info",
    description: "Tìm lời bài hát",
    usage: "<PREFIX>lyrics <tên bài hát>",
    example: "<PREFIX>lyrics bad guy",
    run: async (client, message, args) => {
        if (!args[0]) return message.reply("Nhập tên bài hát cần tìm lyrics");
        const song = args.join(' ');
        const respond = await ksoft.lyrics.get(song, false)
            .catch(err => {
                return message.channel.send(err.message);
            });
        const lyrics_length = respond.lyrics.length;
        const lyrics = respond.lyrics;
        if (lyrics_length > 4095) return message.reply("Lyrics của bài hát bạn đang tìm quá dài để bot có thể xử lý.");
        if (lyrics_length > 2048) {
            const firstembed = new MessageEmbed()
                .setAuthor(`Song: ${respond.name} by ${respond.artist.name}`)
                .setDescription(lyrics.slice(0, 2048))
                .setFooter('Powered by KSoft.Si');
            const secondembed = new MessageEmbed()
                .setDescription(lyrics.slice(2048, lyrics.length))
                .setFooter('Powered by KSoft.Si');
            message.channel.send(firstembed);
            message.channel.send(secondembed);
        } else {
            const embed = new MessageEmbed()
                .setAuthor(`Song: ${respond.name} by ${respond.artist.name}`)
                .setDescription(lyrics)
                .setFooter('Powered by KSoft.Si');
            message.channel.send(embed);
        }
    },
};