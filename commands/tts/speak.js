const googleURL = 'https://translate.google.com';
const { getAudioUrl } = require('google-tts-api');
const { sleep } = require('../../functions/utils');
const langList = require('../../assets/json/ttslang.json');
const db = require('quick.db');
const ms = require('ms');
const randomNum = require('random-number-csprng');
const timeOut = new Set();
module.exports = {
    name: 'speak',
    aliases: ['say', 's'],
    category: 'tts',
    description: 'talk',
    usage: '<PREFIX>speak [lang] <text>',
    note: 'lang = en hoặc vi (mặc định là vi)',
    example: '<PREFIX>speak en hello world',
    run: async (client, message, args) => {
        let connection = message.member.voice ? message.member.voice.connection : null;
        if (db.get(`${message.guild.id}.botdangnoi`) === true) {
            const random = await randomNum(0, 100);
            return message.channel.send(`Có người khác đang xài lệnh rồi, vui lòng thử lại sau D:. ${random > 70 ? ` Nếu bạn nghĩ đây là lỗi, sử dụng lệnh \`${db.get(`${message.guild.id}.prefix`)}fix\` để sửa lỗi!` : ''}`);
        }
        if (!args[0]) return message.channel.send('Vui lòng nhập gì đó :D.');
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Bạn phải vào voice channel để có thể sử dụng lệnh này.');
        const botpermission = voiceChannel.permissionsFor(client.user);
        if (!botpermission.has('CONNECT')) return message.channel.send('Bot không có quyền vào channel của bạn!');
        if (!botpermission.has('SPEAK')) return message.channel.send('Bot không có quyền nói trong channel của bạn!');
        if (!voiceChannel.joinable) return message.channel.send('Bot không vào được phòng của bạn');
        let text = args.join(' ');
        let lang = await db.get(`${message.guild.id}.defaulttts`);
        if (!lang) lang = 'vi-VN';
        if (langList[args[0]]) {
            text = args.slice(1).join(' ');
            lang = langList[args[0]];
        }
        // create request
        if (!connection) {
            try {
                connection = await voiceChannel.join();
                await sleep(1000);
            }
            catch(e) {
                return message.channel.send('Bot không thể vào channel của bạn vào lúc này, vui lòng thử lại sau!');
            }
        }
        if (!connection) return message.channel.send('Bot không thể vào channel của bạn vào lúc này, vui lòng thử lại sau!');
        if (!message.guild.me.voice.selfDeaf) await message.guild.me.voice.setSelfDeaf(true);
        const url = getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: googleURL,
        });
        const dispatcher = connection.play(url);
        await db.set(`${message.guild.id}.botdangnoi`, true);
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
    },
};