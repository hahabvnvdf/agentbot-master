const random = require('random-number-csprng');
module.exports = {
    name: "random",
    category: "fun",
    description: "Random 1 số từ 0 tới x",
    usage: '<PREFIX>random <số tối đa>',
    example: '<PREFIX>random 100 (sẽ random từ 0 tới 100)',
    run: async (client, message, args) => {
        if (!args[0] || isNaN(args[0])) return message.reply('Bạn phải ghi số lớn nhất có thể quay ra!');
        if (args[1] && isNaN(args[1])) return message.reply('Số không hợp lệ, vui lòng thử lại sau!');
        try {
            const randomNum = await random(args[1] ? args[0] : 0, args[1] ? args[1] : args[0]);
            return message.channel.send(`🎲 Số của bạn là: ${randomNum}`);
        }
        catch {
            return message.channel.send('Số không hợp lệ!');
        }
    },
};