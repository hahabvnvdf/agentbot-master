const canva = require('canvacord');
const { MessageAttachment } = require('discord.js');
const db = require('quick.db');
const shipDb = new db.table('shipDb');
module.exports = {
    name: "tat",
    aliases: ["tats", "tát"],
    category: "images",
    description: "Vẫn là tát nhưng kiểu khác",
    usage: "<PREFIX>tat [@tag]",
    example: "<PREFIX>tat @phamleduy04",
    run: async (client, message, args) => {
        const url1 = message.author.displayAvatarURL({ format: 'png', dynamic: false });
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const avaurl = nguoitag.user.displayAvatarURL({ format: 'png', dynamic: false });
        const image = await canva.batslap(url1, avaurl);
        const attach = new MessageAttachment(image, 'batslap.png');
        message.channel.send(attach);
        if (shipDb.has(message.author.id)) {
            const authorData = await shipDb.get(message.author.id);
            if (authorData.target.id == nguoitag.id) {
                authorData.target.slaps++;
                await shipDb.set(message.author.id, authorData);
            }
        }
    },
};