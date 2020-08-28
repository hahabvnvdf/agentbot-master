const { MessageEmbed, MessageAttachment } = require('discord.js');
const { readdirSync, readFileSync } = require('fs');
module.exports = {
    name: 'girl',
    category: 'images',
    description: 'Show ảnh gái xD (nguồn từ gaixinhchonloc.com)',
    aliases: ['gai', 'gái'],
    usage: 'girl',
    run: async (client, message, args) => {
        let folder = readdirSync("././assets/gaixinhchonloc");
        let randomFile = folder[Math.floor(Math.random() * folder.length)]
        let file = readFileSync(`././assets/gaixinhchonloc/${randomFile}`);
        let ext = randomFile.slice(-3);
        let attachment = new MessageAttachment(file, `gaixinh.${ext}`);
        let embed = new MessageEmbed()
            .attachFiles(attachment)
            .setImage(`attachment://gaixinh.${ext}`)
            .setFooter('Nguồn: gaixinhchonloc.com')
        message.channel.send(embed);
    }
}