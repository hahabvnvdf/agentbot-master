const SQLite = require('better-sqlite3');
const sql = new SQLite('./data.sqlite');
const publicIP = require('public-ip');
const { TYPE_RUN } = process.env;
const axios = require('axios');
const instance = axios.create({
    baseURL: 'https://discord.bots.gg/api/v1/',
    timeout: 10000,
    headers: { "Authorization": DBOTGG },
});
const { laysodep } = require('./functions/utils');
const ipgeolocation = process.env.IPGEOLOCATION;

module.exports = async (client, id) => {
    console.log(`Shard id ${id} is ready!`);
    // database
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'xpdata';").get();
    if (!table['count(*)']) {
      sql.prepare("CREATE TABLE xpdata (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER);").run();
      sql.prepare("CREATE UNIQUE INDEX idx_xpdata_id ON xpdata (id);").run();
      sql.pragma("synchronous = 1");
      sql.pragma("journal_mode = wal");
    }
    client.getScore = sql.prepare("SELECT * FROM xpdata WHERE user = ? AND guild = ?");
    client.setScore = sql.prepare("INSERT OR REPLACE INTO xpdata (id, user, guild, xp, level) VALUES (@id, @user, @guild, @xp, @level);");

    const myIP = await publicIP.v4();
    const res = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${ipgeolocation}&ip=${myIP}`);
    global.IPDATA = res.data;

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
};

async function getGuildCount(client) {
    const arr = await client.shard.fetchClientValues('guilds.cache.size');
    return arr.reduce((p, n) => p + n, 0);
}