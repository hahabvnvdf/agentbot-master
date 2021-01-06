const ms = require('ms');
const ga = require('../../functions/giveaway');
module.exports = {
    name: 'startgiveaway',
    aliases: ['start', 'startga'],
    category: 'giveaway',
    description: 'Bắt đầu Giveaway',
    usage: '<PREFIX>start <thời gian GA(10s, 20m, 1d)> <số người thắng> <phần thưởng>',
    example: '<PREIFX>start 1d 1 100000 agent money',
    run: async (client, message, args) => {
        client.giveawaysManager.start(message.channel, {
            time: ms(args[0]),
            winnerCount: parseInt(args[1]),
            prize: args.slice(2).join(' '),
            messages: ga.message,
        }).then(gaData => {
            console.log(gaData);
        });
    },
};