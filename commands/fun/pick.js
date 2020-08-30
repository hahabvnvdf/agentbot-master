module.exports = {
    name: "pick",
    category: "fun",
    description: "Bot sẽ giúp bạn chọn!",
    usage: "pick <lựa chọn 1, lựa chọn 2, ...>",
    example: "pick chơi game, học bài",
    run: async (client, message, args) => {
        const pickWordlist = args.join(' ').split(',');
        const random = pickWordlist[Math.floor(Math.random() * pickWordlist.length)];
        return message.channel.send(random);
    },
};