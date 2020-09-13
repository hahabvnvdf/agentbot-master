const eco = require('../../functions/economy');
const coin_gif = '<a:coin:710976678561841153>';
const random = ['head', 'tail'];
const dict = {
    'head': '<:head:710976679203438703>',
    'tail': '<:tail:710976679568474202>',
};
const { laysodep, sleep } = require('../../functions/utils');
const ms = require('ms');
const maxBet = 50000;
module.exports = {
    name: 'coinflip',
    aliases: ['cf'],
    cooldown: 5,
    category: 'gamble',
    description: 'Tung đồng xu (50%)',
    usage: '<PREFIX>coinflip <Lựa chọn của bạn> <tiền cược>',
    example: '<PREFIX>coinflip t 50000',
    run: async (client, message, args) => {
        let user_choose = args[0];
        if (!user_choose || user_choose == 'all' || !isNaN(user_choose)) return message.channel.send('Vui lòng chọn head hoặc tail.');
        switch(user_choose.toLowerCase()) {
            case 'tail':
            case 't':
                user_choose = 'tail';
                break;
            default:
                user_choose = 'head';
                break;
        }
        const amount = await eco.fetchMoney(message.author.id);
        let bet = 1;
        if (!args[1]) return message.channel.send('Vui lòng nhập tiền cược');
        if (!isNaN(args[1])) bet = parseInt(args[0]);
        if (args[1].toLowerCase() == 'all') bet = 'all';
        else if (amount === undefined) return message.channel.send('Vui lòng nhập tiền cược');
        else if (amount <= 0) return message.channel.send('Tiền cược không thể nhỏ hơn hoặc bằng 0.');
        if (bet == 'all') {
            if (maxBet < bet && maxBet > amount) {
                bet = amount;
            }
            else bet = maxBet;
        }
        if (bet > maxBet) bet = maxBet;
        if (bet > amount) return message.channel.send('Bạn không đủ tiền để chơi');
        await message.channel.send(`${coin_gif} **${message.author.tag}** cược **${laysodep(bet)}** và đã chọn **${user_choose}**!`);
        // random
        const userrand = random[Math.floor(Math.random() * random.length)];
        const final = check(user_choose, userrand);
        sleep(ms('4s'));
        if (final === true) {
            // win
            message.channel.send(`Và kết quả là ${dict[userrand]}(**${userrand}**), bạn đã thắng **${laysodep(bet)}**.`);
            await money(message.author.id, 'win', bet);
        } else if (final === false) {
            // lose
            message.channel.send(`Và kết quả là ${dict[userrand]}(**${userrand}**), bạn đã mất hết tiền cược.`);
            await money(message.author.id, 'lose', bet);
        } else {
            // k trừ tiền
            message.channel.send('Bot lỗi, bạn sẽ không bị trừ tiền!');
        }
    },
};

function check(user_choose, userrand) {
    if (!user_choose || !userrand) return null;
    if (user_choose == userrand) return true;
    else return false;
}

async function money(userid, kind, bet) {
    if (!userid || !bet) return null;
    if (kind == 'win') {
        await eco.addMoney(userid, bet);
    } else {
        await eco.subtractMoney(userid, bet);
    }
}