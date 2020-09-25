module.exports = {
    name: 'unhide',
    aliases: ['hienchannel'],
    description: 'Hiện channel nào đó (role @everyone)',
    usage: '<PREFIX>unhide <#channel>',
    run: async(client, message, args) => {
        const everyoneRole = message.guild.roles.everyone;
        if(!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply('Bạn cần có quyền `MANAGE_CHANNELS` để chạy lệnh này!');
        if (!args[0]) return message.channel.send('Vui lòng nhập channel!');
        let id = args[0];
        if (id.startsWith("<#")) id = id.slice(2, id.length - 1);
        const channel = message.guild.channels.cache.get(id);
        if (!channel) return message.channel.send('Channel bạn nhập không hợp lệ!');
        try {
            await channel.overwritePermissions(everyoneRole, {
                VIEW_CHANNEL: true
            })
            message.channel.send('Thao tác thành công');
        }
        catch(e) {
            message.channel.send(`Bot lỗi: ${e.message}`)
        }
    }
}