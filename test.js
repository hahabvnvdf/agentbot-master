const { Client } = require('discord.js');
const client = new Client({
    disableMentions: 'everyone',
});
const { readdirSync } = require('fs');

try {
    client.login(process.env.TESTBOTTOKEN);

    client.on('ready', () => {
        const channel = client.channels.cache.get(process.env.CHANNELID);
        readdirSync("./commands/").forEach(dir => {
            const commands = readdirSync(`./commands/${dir}/`).filter(file => file.endsWith('.js'));
            for (const file of commands) {
                const pull = require(`./commands/${dir}/${file}`);
                channel.send(pull.name);
            }
        });
    });
}

catch(err) {
    throw new Error(err);
}
