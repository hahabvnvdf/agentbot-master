const db = require('quick.db');
const dict = require('../../assets/json/playdatadict.json');
const ms = require('ms');
module.exports = {
    name: 'play',
    aliases: ['p'],
    usage: '<PREFIX>p',
    note: 'Lệnh này chỉ cho Saddu, Duy.',
    ownerOnly: true,
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send('Nhập file cần play!');
        const status = await db.get(`${message.guild.id}.botdangnoi`);
        if (status == true) return message.channel.send('Có người khác đang sử dụng bot!');
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Bạn phải vào voice channel để sử dụng lệnh này.');
        const botPremission = voiceChannel.permissionsFor(client.user);
        if (!botPremission.has('CONNECT')) return message.channel.send('Bot không có quyền vào channel này!');
        if (!botPremission.has('SPEAK')) return message.channel.send('Bot không có quyền nói ở channel này!');
        if (args[0] == 'showdict') return message.channel.send(JSON.stringify(dict, null, 4), { code: "json" });
        if (!dict[args[0]]) {
            const prefix = await db.get(`${message.guild.id}.prefix`);
            return message.channel.send(`Sử dụng lệnh \`${prefix}play showdict \` để xem tất cả file hiện có`);
        } else {
            voiceChannel.join().then(async connection => {
                await db.set(`${message.guild.id}.botdangnoi`, true);
                const dispatcher = connection.play(dict[args[0]]);
                await db.set(`${message.guild.id}.endTime`, Date.now() + ms('5m'));
                dispatcher.on('finish', async () => {
                    await db.set(`${message.guild.id}.botdangnoi`, false);
                    setTimeout(async () => {
                        const time = await db.get(`${message.guild.id}.endTime`);
                        if (Date.now() > time) {
                            connection.disconnect();
                            voiceChannel.leave();
                            message.channel.send('Đã rời phòng vì không hoạt động!');
                        }
                    }, ms('5m') + 1000);
                });
            });
        }
    },
};