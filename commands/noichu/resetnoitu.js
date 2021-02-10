const { updateNoiTu } = require('../../functions/utils');
module.exports = {
    name: 'resetnoitu',
    aliases: ['rsnoitu'],
    description: 'Reset nối từ',
    usage: '<PREFIX>rsnoitu',
    run: async (client, message, args, guildDb) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send('Bạn không có quyền `MANAGE_GUILD` để sử dụng lệnh này!');
        await updateNoiTu(message.guild.id, guildDb.maxWords);
        message.channel.send('✅ | Thao tác thành công!');
    },
};