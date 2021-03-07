const { addMoney } = require('../../functions/economy');
const random = require('random-number-csprng');
module.exports = {
    name: 'work',
    category: 'gamble',
    description: 'Kiếm tiền!',
    note: 'Tỉ lệ trúng 100% nhưng sẽ ít hơn sult',
    cooldown: 120,
    run: async (client, message, args) => {
        const randomNum = await random(500, 1000);
        await addMoney(message.author.id, randomNum);
        return message.channel.send(`Bạn đã nhận được: 💵 \`${randomNum}\` Agent money.`);
    },
};