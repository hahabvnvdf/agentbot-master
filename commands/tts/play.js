const db = require('quick.db');
const dict = require('../../assets/json/playdatadict.json');
const ms = require('ms');
const { sleep } = require('../../functions/utils');
const timeOut = new Set();
module.exports = {
    name: 'play',
    category: 'tts',
    aliases: ['p'],
    usage: '<PREFIX>p <tên>',
    run: async (client, message, args) => {
        const prefix = await db.get(`${message.guild.id}.prefix`);
        if (!args[0]) return message.channel.send('Nhập file cần play!');
        const status = await db.get(`${message.guild.id}.botdangnoi`);
        if (status == true) return message.channel.send('Có người khác đang sử dụng bot!');
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Bạn phải vào voice channel để sử dụng lệnh này.');
        const botPremission = voiceChannel.permissionsFor(client.user);
        if (!botPremission.has('CONNECT')) return message.channel.send('Bot không có quyền vào channel này!');
        if (!botPremission.has('SPEAK')) return message.channel.send('Bot không có quyền nói ở channel này!');
        if (args[0] == 'showdict') {
            const list = createArr(dict).map(e => `\`${e}\``).join(', ');
            return message.channel.send(`Lệnh: ${prefix}play <tên>\n\n${list}`);
        }
        if (!dict[args[0]]) return message.channel.send(`Tên không tồn tại! Sử dụng lệnh \`${prefix}play showdict\` để xem tất cả tên hiện có`);
        else {
            const bot = message.guild.me;
            let connection = bot.voice ? bot.voice.connection : null;
            if (!connection || bot.voice.channelID !== voiceChannel.id) {
                connection = await voiceChannel.join();
                await sleep(1000);
            }
            if (!connection) return message.channel.send('Bot không thể vào channel của bạn vào lúc này, vui lòng thử lại sau!');
            if (!message.guild.me.voice.selfDeaf) await message.guild.me.voice.setSelfDeaf(true);
            await db.set(`${message.guild.id}.botdangnoi`, true);
            const dispatcher = connection.play(`./assets/playdata/${dict[args[0]]}`);
            await db.set(`${message.guild.id}.endTime`, Date.now() + ms('5m'));
            dispatcher.on('finish', async () => {
                dispatcher.destroy();
                await db.set(`${message.guild.id}.botdangnoi`, false);
                if (!timeOut.has(message.guild.id)) {
                    timeOut.add(message.guild.id);
                    setTimeout(async () => {
                        const checkTime = await db.get(`${message.guild.id}.endTime`);
                        if (!checkTime) return;
                        if (Date.now() > checkTime) {
                            connection.disconnect();
                            voiceChannel.leave();
                            message.channel.send('Đã rời phòng vì không hoạt động!');
                        }
                        if (!message.guild.me.voice) await db.delete(`${message.guild.id}.endTime`);
                        timeOut.delete(message.guild.id);
                    }, ms('5m') + 1000);
                }
            });
        }
    },
};

function createArr(json) {
    if (typeof json !== 'object') return null;
    const arr = [];
    for (const key in json) {
        arr.push(key);
    }
    return arr;
}