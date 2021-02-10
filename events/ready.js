const SQLite = require('better-sqlite3');
const sql = new SQLite('./data.sqlite');
const { TYPE_RUN, DBOTGG, TOPGG } = process.env;
const { log } = require('../functions/log');
const { laysodep } = require('../functions/utils');
const axios = require('axios');
const instance = axios.create({
    baseURL: 'https://discord.bots.gg/api/v1/',
    timeout: 10000,
    headers: { "Authorization": DBOTGG },
});
const db = require('quick.db');
module.exports = async (client) => {
    console.log(`Hi, ${client.user.username} is now online!`);

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
    const guildCount = TYPE_RUN == 'production' ? await getGuildCount(client) : client.guilds.cache.size;

    // set presence
    client.user.setPresence({
        status: "online",
        activity: {
            name: `Đang phục vụ ${laysodep(guildCount)} servers`,
            type: "PLAYING",
        },
    });

    if (TYPE_RUN == 'production') {
        const DBL = require('dblapi.js');
        const dbl = new DBL(TOPGG, client);
        dbl.on('error', e => {
            log(e);
        });
        instance.post(`bots/${client.user.id}/stats`, {
            guildCount: guildCount,
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
    }

    // change all voice status to default
    const allDb = db.all();
    for (let i = 0; i < allDb.length; i++) {
        try {
            const guild = allDb[i].ID;
            db.set(`${guild}.botdangnoi`, false);
        }
        catch(e) {
            console.log(e.message);
            continue;
        }
    }

    console.log('botdangnoi reseted!');
};

async function getGuildCount(client) {
    const arr = await client.shard.fetchClientValues('guilds.cache.size');
    return arr.reduce((p, n) => p + n, 0);
}