const { ShardingManager } = require('discord.js');
require("dotenv").config();
const { TOKEN, TOPGG, TYPE_RUN, DBOTGG } = process.env;
const { laysodep } = require('../functions/utils');
const AutoPoster = require('topgg-autoposter');
const axios = require('axios');
const instance = axios.create({
    baseURL: 'https://discord.bots.gg/api/v1/',
    timeout: 10000,
    headers: { "Authorization": DBOTGG },
});
const manager = new ShardingManager('./bot.js', {
    totalShards: 'auto',
    token: TOKEN,
});

const poster = AutoPoster(TOPGG, manager);

poster.on('posted', () => {
    console.log('Posted stats to top.gg');
});

manager.on('shardCreate', (shard) => console.log(`Shard ${shard.id} đã được spawn!`));

(async () => {
    await manager.spawn();

    const guildCount = TYPE_RUN == 'production' ? await getGuildCount(client) : client.guilds.cache.size;
    client.user.setPresence({
        status: "online",
        activity: {
            name: `Đang phục vụ ${laysodep(guildCount)} servers`,
            type: 'PLAYING',
        },
    });
    setInterval(function() {
        client.user.setPresence({
            status: "online",
            activity: {
                name: `Đang phục vụ ${laysodep(guildCount)} servers`,
                type: 'PLAYING',
            },
        });
        instance.post(`bots/${client.user.id}/stats`, {
            guildCount: guildCount,
        });
    }, 36e5);
})();

async function getGuildCount(client) {
    const arr = await client.shard.fetchClientValues('guilds.cache.size');
    return arr.reduce((p, n) => p + n, 0);
}
