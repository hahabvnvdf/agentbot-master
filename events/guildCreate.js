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
    const logChannel = await client.shard.fetchClientValues('channels.fech("80913923852402690")');
    if (!logChannel) return console.log('Log channel is null!');
    return await logChannel.send(embed);
    // agent's server
};