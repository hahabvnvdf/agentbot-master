module.exports = {
    name: "pick",
    category: "fun",
    description: "Bot sẽ giúp bạn chọn!",
    usage: "<PREFIX>pick <lựa chọn 1, lựa chọn 2, ...>",
    example: "<PREFIX>pick chơi game, học bài",
    run: async (client, message, args) => {
        const pickWordlist = args.join(' ').split(',');
        message.channel.send(pickWordlist[Math.floor(Math.random() * pickWordlist.length)]);
    },
};