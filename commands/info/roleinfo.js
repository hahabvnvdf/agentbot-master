const { MessageEmbed } = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports = {
    name: "roleinfo",
    category: "info",
    description: "Trà về thông tên về role",
    usage: '<PREFIX>roleinfo <tên role>',
    run: async (client, message, args) => {
        const roles = message.guild.roles.cache.filter(r => r.managed === false).map(g => g.name);
        const search = args.join(' ');
        const matches = stringSimilarity.findBestMatch(search, roles);
        const find = matches.bestMatch.target;
        let role = message.guild.roles.cache.find(el => el.name === find);
        if (!isNaN(args[0])) role = message.guild.roles.cache.get(args[0]);
        const membersWithRole = message.guild.roles.cache.get(role.id).members;
        const embed = new MessageEmbed()
            .setColor(role.color)
            .setTitle("Roleinfo")
            .addField("ID: ", role.id)
            .addField("Tên role: ", role.name, true)
            .addField("Số lượng:", membersWithRole.size, true)
            .addField("Vị trí: ", role.position, true)
            .addField("Mentionable: ", role.mentionable, true)
            .addField("Hoist: ", role.hoist, true)
            .addField("Màu: ", role.hexColor, true);
        message.channel.send(embed);
    },
};