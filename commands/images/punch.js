const { MessageEmbed, MessageAttachment } = require("discord.js");
const { readFileSync, readdirSync } = require('fs');
const db = require('quick.db');
const shipDb = new db.table('shipDb');
module.exports = {
    name: "punch",
    aliases: ['đấm', 'dam'],
    category: "images",
    description: "Đấm ai đó",
    usage: "<PREFIX>punch <@tag>",
    run: async (client, message, args) => {
        const folder = readdirSync("././assets/slap");
        const file = readFileSync(`././assets/slap/${folder[Math.floor(Math.random() * folder.length)]}`);
        const attachment = new MessageAttachment(file, 'punch.gif');
        const nguoitag = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const embed = new MessageEmbed()
            .attachFiles(attachment)
            .setImage('attachment://punch.gif');
        if (nguoitag.length == 0) embed.setDescription(`${message.member} đã tự đấm chính mình 👊`);
        else embed.setDescription(`${message.member} đã đấm vỡ mồm ${nguoitag} 👊`);
        if (shipDb.has(message.author.id)) {
            const authorData = await shipDb.get(message.author.id);
            if (authorData.target.id == nguoitag.id) {
                authorData.target.punch++;
                await shipDb.set(message.author.id, authorData);
                embed.setFooter(`Cú đấm ${authorData.target.punch !== 1 ? `thứ ${authorData.target.punch}` : 'đầu tiên'} của bạn.`);
            }
        }
        message.channel.send(embed);
    },
};