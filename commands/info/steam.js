const { MessageEmbed } = require("discord.js");
const axios = require('axios');
const moment = require('moment');
const db = require('quick.db');
const steamDB = new db.table('steamdb');
const steam_token = process.env.STEAMTOKEN;
module.exports = {
    name: "steam",
    category: "info",
    description: "Tra thông tin steam. Sử dụng set nếu lần sau không cần phải nhập steamID.",
    usage: "<PREFIX>steam [set] <steamID 64>",
    example: "<PREFIX> steam 76561198282352473",
    run: async (bot, message, args) => {
        const embed = new MessageEmbed();
        let userInput = args[0];
        if (!userInput) {
                if (steamDB.has(message.author.id)) userInput = await steamDB.get(message.author.id);
                else return message.channel.send(invalid_input(embed));
        } else if (userInput.toLowerCase() == 'set') {
            await steamDB.set(message.author.id, args[1]);
            return await message.react('✅');
        }
        const publicinfo = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steam_token}&steamids=${userInput}`);
        if (publicinfo.data.response.players.length == 0) return message.channel.send(invalid_input(embed));
        const { gameextrainfo, personaname, avatarfull, timecreated, loccountrycode, personastate, realname, profileurl, steamid } = publicinfo.data.response.players[0];
        const state = ["Offline", "Online", "Busy", "Away", "Snooze", "Looking to trade", "Looking to play"];
        embed.setAuthor(`${personaname} (${steamid})`)
            .setColor('#00ffff')
            .setTitle('Link tới profile')
            .setURL(profileurl)
            .setThumbnail(avatarfull)
            .addField('Thông tin cá nhân', [
                `Tên đầy đủ: ${realname || "Không có"}`,
                `Trạng thái: ${state[personastate]}`,
                `Quốc gia: :flag_${loccountrycode ? loccountrycode.toLowerCase() : "white"}:`,
                `Ngày tạo steam: ${moment.unix(timecreated).format("DD/MM/YYYY")}`,
                `${gameextrainfo ? `Đang chơi: ${gameextrainfo}` : ""}`,
            ]);
        const vacban = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${steam_token}&steamids=${userInput}`);
        const { NumberOfVACBans, NumberOfGameBans } = vacban.data.players[0];
            embed.addField('Thông tin VAC', [
                `Số lần bị VAC Ban: ${NumberOfVACBans}`,
                `Số lần bị Game Ban: ${NumberOfGameBans}`,
            ])
            .setFooter('Sử dụng steam set <ID> để lưu ID của bạn!');
        message.channel.send(embed);
    },
};

function invalid_input(embed) {
    embed.setTitle('Hãy nhập SteamID 64 của bạn')
        .setDescription('Nếu bạn không biết steamID của mình hãy [click vào đây](https://steamid.io/)');
    return embed;
}