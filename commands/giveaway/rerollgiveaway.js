module.exports = {
    name: 'rerollgiveaway',
    aliases: ['reroll', 'quaylai', 'rerollgiveaways'],
    description: 'Chọn người chiến thắng khác',
    usage: '<PREFIX>reroll <messageID>',
    run: async (client, message, args) => {
        client.giveawaysManager.reroll(messageID).then(() => {
            message.channel.send('Thao tác thành công! Giveaway của bạn đã được quay lại!');
        }).catch(() => {
            message.channel.send(`Không tìm thấy giveaway của bạn!`);
        });
    },
};