const { MessageEmbed, MessageAttachment } = require("discord.js");
const { readFileSync, readdirSync } = require('fs');
module.exports = {
    name: "punch",
    category: "images",
    description: "Punch someone :D ",
    usage: "punch <@tag>",
    run: (client, message, args) => {
        const folder = readdirSync("././assets/slap");
        const file = readFileSync(`././assets/slap/${folder[Math.floor(Math.random() * folder.length)]}`);
        const attachment = new MessageAttachment(file, 'punch.gif');
        const nguoitag = message.mentions.members.array() || message.guild.members.cache.get(args[0]);
        const embed = new MessageEmbed()
            .attachFiles(attachment)
            .setImage('attachment://punch.gif');
        if (nguoitag.length == 0) {
            embed.setDescription(`${message.member} đã tự đấm chính mình 👊`);
        } else {
            embed.setDescription(`${message.member} đã đấm vỡ mồm ${nguoitag} 👊`);
        }
        message.channel.send(embed);

    },
};