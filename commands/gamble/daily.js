module.exports = {
    name: "daily",
    category: 'gamble',
    aliases: ['hangngay'],
    description: "Nhận tiền hàng ngày",
    usage: 'daily',
    note: 'Upvote bot để nhận tiền!',
    run: async (client, message, args) => {
        message.channel.send('Lệnh này hiện đang bảo trì!');
    },
};