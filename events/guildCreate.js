const { MessageEmbed } = require('discord.js');
module.exports = async (client, newguild) => {
    const owner = await newguild.members.fetch(newguild.ownerID);
    await newguild.members.fetch();
    const embed = new MessageEmbed()
        .setTitle("New Server Joined")
        .addField('Guild Name: ', newguild.name, true)
        .addField('Guild ID: ', newguild.id, true)
        .addField("Guild members: ", newguild.memberCount, true)
        .addField("Owner server: ", owner.user.tag, true)
        .setFooter(`OwnerID: ${newguild.ownerID}`);
    await client.shard.broadcastEval(`let logChannel = this.channels.fetch("809139238524026900");
    logChannel = logChannel.filter(el => el);
    if (logChannel.length == 0) console.log('Log channel is null');
    else logChannel[0].send(${embed});`);
    // agent's server
};