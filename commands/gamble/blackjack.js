const eco = require('../../functions/economy');
const { getcardvalue, randomcard, checkautowin, createembed, laysodep, createembedfield, locbai } = require('../../functions/utils');
const check_game = new Set();
const hitemoji = "👊";
const stopemoji = "🛑";
const ms = require('ms');
module.exports = {
    name: 'blackjack',
    category: 'gamble',
    cooldown: 10,
    aliases: ['bj'],
    description: 'Chơi blackjack (xì dách)',
    note: 'Trên 21 điểm là thua :)',
    usage: 'backjack <tiền cược>',
    example: 'bj 10000',
    run: async (client, message, args) => {
        if (check_game.has(message.author.id)) return message.channel.send('Bạn chưa hoàn thành ván đấu, vui lòng hoàn thành ván chơi!');
        const playerDeck = [];
        const botDeck = [];
        const maxbet = 500000;
        const backcard = '<:back:709983842542288899>';
        const hide_deck = [];
        let listofcard = require('../../assets/cardemojis.json').fulllist;
        // check bet
        const amount = await eco.fetchMoney(message.author.id);
        let bet;
        if (args[0] == 0) return message.channel.send('Bạn không thể cược 0.');
        if (args[0] == 'all') {
            bet = 100000;
            if (bet > amount) bet = amount;
        }
        else if (isNaN(args[0])) return message.channel.send('Vui lòng nhập tiền cược!');
        else bet = args[0];
        if (bet > parseInt(amount) || amount == 0) return message.channel.send('Bạn không có đủ tiền để chơi!');
        else if (bet > maxbet) bet = maxbet;
        check_game.add(message.author.id);
        for (let i = 0; i < 2; i++) {
            playerDeck.push(await randomcard(listofcard));
            listofcard = locbai(listofcard, playerDeck);
            botDeck.push(await randomcard(listofcard));
            listofcard = locbai(listofcard, botDeck);
            hide_deck.push(backcard);
        }
        const embed = createembed(message.author, laysodep(bet), createembedfield(playerDeck), createembedfield(botDeck), getcardvalue(playerDeck), getcardvalue(botDeck), createembedfield(hide_deck), "not");
        const msg = await message.channel.send(embed);
        // check coi có xi dach hoac xi bang
        const player_first = checkautowin(playerDeck);
        if (player_first.check == true) {
            if (player_first.loaiwin == 'xidach') {
                // cong tien thuong
                await eco.addMoney(message.author.id, bet);
                check_game.delete(message.author.id);
                return await msg.edit(createembed(message.author, laysodep(bet), createembedfield(playerDeck), createembedfield(botDeck), getcardvalue(playerDeck), getcardvalue(botDeck), createembedfield(hide_deck), "thang"));
            } else if (player_first.loaiwin == 'xibang') {
                // x2 tien thuong
                await eco.addMoney(message.author.id, bet * 2);
                check_game.delete(message.author.id);
                return await msg.edit(createembed(message.author, laysodep(bet), createembedfield(playerDeck), createembedfield(botDeck), getcardvalue(playerDeck), getcardvalue(botDeck), createembedfield(hide_deck), "thangx2"));
            }
        } else if (checkautowin(botDeck).check == true) {
                await eco.subtractMoney(message.author.id, bet);
                check_game.delete(message.author.id);
                return await msg.edit(createembed(message.author, laysodep(bet), createembedfield(playerDeck), createembedfield(botDeck), getcardvalue(playerDeck), getcardvalue(botDeck), createembedfield(hide_deck), "thua"));
        }
        msg.react(hitemoji);
        msg.react(stopemoji);
        const filter = (reaction, user) => {
            return (reaction.emoji.name === hitemoji || reaction.emoji.name === stopemoji) && user.id === message.author.id;
        };
        const collector = msg.createReactionCollector(filter, { time: ms('1m') });
        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === hitemoji) {
                playerDeck.push(await randomcard(listofcard));
                listofcard = locbai(listofcard, playerDeck);
                if (getcardvalue(playerDeck) > 21 || parseInt(getcardvalue(playerDeck).replace('*', '')) > 21) {
                    collector.stop();
                    return await stop(message.author, listofcard, botDeck, playerDeck, msg, bet, check_game);
                }
                await msg.edit(createembed(message.author, laysodep(bet), createembedfield(playerDeck), createembedfield(botDeck), getcardvalue(playerDeck), getcardvalue(botDeck), createembedfield(hide_deck), "not"));
            } else if (reaction.emoji.name === stopemoji) {
                collector.stop();
                await stop(message.author, listofcard, botDeck, playerDeck, msg, bet, check_game);
            }
        });
        collector.on('end', async (collected, reason) => {
            if (reason == 'time') {
                msg.edit('Trò chơi hết hạn. Bạn sẽ bị trừ tiền.');
                money(message.author.id, "thua", bet);
            }
            check_game.delete(message.author.id);
        });
    },
};
// eslint-disable-next-line no-shadow
async function stop(player, listofcard, botDeck, playerDeck, msg, bet, check_game) {
    check_game.delete(player.id);
    while (getcardvalue(botDeck) < 15 || parseInt(getcardvalue(botDeck).replace('*', '')) < 15) {
        botDeck.push(await randomcard(listofcard));
        listofcard = locbai(listofcard, botDeck);
    }
    let kind_of_winning;
    let bot_points = getcardvalue(botDeck);
    let user_points = getcardvalue(playerDeck);
    if (isNaN(bot_points)) bot_points = parseInt(bot_points.replace('*', ''));
    if (isNaN(user_points)) user_points = parseInt(user_points.replace('*', ''));
    if (user_points > 21 && bot_points > 21) {
        kind_of_winning = 'hoa';
    } else if (user_points == bot_points) {
        kind_of_winning = 'hoa';
    } else if (user_points > 21) {
        kind_of_winning = 'thua';
        await money(player.id, 'lose', bet);
    } else if (bot_points > 21) {
        kind_of_winning = 'thang';
        await money(player.id, 'win', bet);
    } else if (user_points > bot_points) {
        kind_of_winning = 'thang';
        await money(player.id, 'win', bet);
    } else {
        kind_of_winning = 'thua';
        await money(player.id, 'lose', bet);
    }
    return await msg.edit(createembed(player, laysodep(bet), createembedfield(playerDeck), createembedfield(botDeck), getcardvalue(playerDeck), getcardvalue(botDeck), null, kind_of_winning));
}

async function money(userid, kind, amount) {
    if (!userid || !amount) return null;
    if (kind == 'win') {
        await eco.addMoney(userid, amount);
    } else {
        await eco.subtractMoney(userid, amount);
    }
}
