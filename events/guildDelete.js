const { MessageEmbed } = require('discord.js');
module.exports = async (client, oldGuild) => {
    const embed = new MessageEmbed()
        .setTitle("Bot left the server!")
        .addField('Guild Name: ', oldGuild.name, true)
        .addField('Guild ID: ', oldGuild.id, true)
        .addField('Guild members: ', oldGuild.memberCount, true)
        .setFooter(`OwnerID: ${oldGuild.ownerID}`);
    await client.shard.broadcastEval(`let logChannel = this.channels.fetch("809139238524026900")
    logChannel = logChannel.filter(el => el)
    if (logChannel.length == 0) return console.log('Log channel is null');
    logChannel[0].send(${embed})`);
// agent's server
};