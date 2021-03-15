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
    const logChannel = await client.channels.fetch('700071755146068099');
    if (!logChannel) return console.log('Log channel is null!');
    return await logChannel.send(embed);
    // agent's server
};