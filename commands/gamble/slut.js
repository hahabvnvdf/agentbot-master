const { addMoney, subtractMoney, fetchMoney } = require('../../functions/economy');
const random = require('random-number-csprng');
module.exports = {
    name: 'slut',
    category: 'gamble',
    description: 'Kiếm tiền nhiều hơn lệnh `work` nhưng sẽ có tỉ lệ thua',
    usage: 'slut',
    cooldown: 120,
    run: async (client, message, args) => {
        const authorID = message.author.id;
        let randomNum = await random(2000, 4000);
        /*
        0: thua
        1: thắng
        */
       const status = await random(0, 1);
       if (status === 1) {
            await addMoney(authorID, randomNum);
            message.channel.send(`Bạn đã nhận được: 💵 \`${randomNum}\` Agent money.`);
       } else {
           const userMoney = await fetchMoney(authorID);
           if (userMoney < randomNum) randomNum = userMoney;
           await subtractMoney(authorID, randomNum);
           message.channel.send(`Bạn đang đứng đường thì bị công an bắt và bị phạt \`${randomNum}\` Agent money. 😢`);
       }
    },
};