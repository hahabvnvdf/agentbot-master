const { MessageEmbed } = require('discord.js');
const { readdirSync } = require('fs');
const db = require('quick.db');
const { ownerID } = require('../../config.json');
module.exports = {
    name: "help",
    aliases: ['h'],
    category: "info",
    description: "Lệnh để xem list lệnh hay chi tiết của 1 lệnh cụ thể",
    usage: "<PREFIX>help",
    run: async (client, message, args) => {
        const server_prefix = await db.get(`${message.guild.id}.prefix`);
        const embed = new MessageEmbed()
            .setColor("#00FFFF")
            .setAuthor(`Help command`, message.guild.iconURL())
            .setThumbnail(client.user.displayAvatarURL());
        if (!args[0]) {
            const categories = readdirSync('./commands/');
            let commandsize = 0;
            categories.forEach(category => {
                const dir = client.commands.filter(c => c.category === category);
                commandsize += parseInt(dir.size);
                const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);
                try {
                    embed.addField(`❯ ${capitalise} [${dir.size} lệnh]:`, dir.map(c => `\`${c.name}\``).join(' '));
                } catch(e) {
                    console.log(e);
                }
            });
            embed.setDescription(`Danh sách lệnh cho bot **${message.guild.me.displayName}**\n Prefix của bot là: \`${server_prefix}\`\nTổng lệnh bot có: ${commandsize} lệnh\nCần sự giúp đỡ nhiều hơn? Hãy tham gia [Agent's Server](https://discord.gg/SEMXgcj)`)
                .setFooter(`Sử dụng ${server_prefix}help {lệnh} để xem chi tiết.`);
            return message.channel.send(embed);
        } else {
            return getCMD(client, message, args[0]);
        }
    },
};
function getCMD(client, message, input) {
    const serverData = db.get(message.guild.id);
    const embed = new MessageEmbed();
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

    let info = `Không tìm thấy lệnh tên là: **${input.toLowerCase()}**`;

    if (!cmd || (cmd.ownerOnly == true && message.author.id !== ownerID)) return message.channel.send(embed.setColor("RED").setDescription(info));

    if (cmd.name) info = `**Tên lệnh**: \`${serverData.prefix}${cmd.name}\``;
    if (cmd.aliases) info += `\n**Tên rút gọn**: ${cmd.aliases.map(a => `\`${serverData.prefix}${a}\``).join(", ")}`;
    if (cmd.description) info += `\n**Chi tiết về bot**: ${cmd.description}`;
    if (cmd.usage) {
        info += `\n**Cách sử dụng lệnh**: \`${cmd.usage}\``;
        embed.setFooter(`Cú pháp: <> = bắt buộc, [] = không bắt buộc`);
    }
    if (cmd.note) info += `\n**Note**: ${cmd.note}`;
    if (cmd.example) info += `\n**VD**: \`${cmd.example}\``;

    return message.channel.send(embed.setColor("GREEN").setDescription(info.replace(/<PREFIX>/g, serverData.prefix)));
}