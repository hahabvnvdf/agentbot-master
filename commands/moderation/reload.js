const { ownerID } = require('../../config.json');
const handler = require('../../handlers/command');
module.exports = {
    name: 'reload',
    description: 'reload command',
    run: async (client, message, args) => {
        if (message.author.id !== ownerID) return message.channel.send('Bạn không thể sử dụng lệnh này!');
        await client.commands.clear();
        await client.aliases.clear();
        await handler(client);
    },
};