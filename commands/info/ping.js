const { MessageEmbed } = require('discord.js');
const publicIP = require('public-ip');
const ipgeolocation = process.env.IPGEOLOCATION;
const axios = require('axios');
const { getPing } = require('../../functions/economy');
module.exports = {
    name: "ping",
    category: "info",
    description: "Returns latency and API ping",
    usage: "<PREFIX>ping",
    run: async (client, message, args) => {
        const msg = await message.channel.send(`🏓 Pinging....`);
        try {
            const myIP = await publicIP.v4();
            let data = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${ipgeolocation}&ip=${myIP}`);
            const mongoPing = await getPing();
            data = data.data;
            const response = await axios.get('https://srhpyqt94yxb.statuspage.io/api/v2/components.json');
            let api = response.data.components.filter(el => el.name == "API");
            api = api[0];
            const embed = new MessageEmbed()
                .addField('Độ trễ (bot):', `${Math.floor(Date.now() - message.createdTimestamp)}ms`, true)
                .addField('Độ trễ (API): ', `${client.ws.ping}ms`, true)
                .addField('Độ trễ (MongoDB): ', [
                    `Read: ${mongoPing.read}ms`,
                    `Write: ${mongoPing.write}ms`,
                    `Avg: ${mongoPing.average}ms`,
                ])
                .addField('Discord API status: ', api.status, true)
                .addField('Vị trí hosting: ', `${data.city}, ${data.state_prov}, ${data.country_code2}`, true);
            msg.edit('Pong! 🏓', embed);
        }
        catch(e) {
            console.log(e);
            return msg.edit(`Pong! \`${Math.floor(Date.now() - message.createdTimestamp)}ms\``);
        }
    },
};