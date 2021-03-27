const { MessageEmbed } = require('discord.js');
module.exports = async (client, oldGuild) => {
    const embed = new MessageEmbed()
        .setTitle("Bot left the server!")
        .addField('Guild Name: ', oldGuild.name, true)
        .addField('Guild ID: ', oldGuild.id, true)
        .addField('Guild members: ', oldGuild.memberCount, true)
        .setFooter(`OwnerID: ${oldGuild.ownerID}`);
    const logChannel = await client.shard.fetchClientValues('channels.fetch("80913923852402690")');
    if (!logChannel) return console.log('Log channel is null!');
    return await logChannel.send(embed);
// agent's server
};