const { post } = require('../../functions/post');
const { readFileSync, existsSync } = require('fs');
module.exports = {
    name: 'exportlog',
    aliases: ['explog'],
    description: 'Xuất log ra hastebin (owner bot only)',
    run: async (client, message, args) => {
        const logPath = '././log.txt';
        if (!existsSync(logPath)) return message.channel.send('Không tìm thấy file log.txt');
        const data = readFileSync(logPath, 'utf-8');
        const res = await post(data);
        message.channel.send(res);
    },
};