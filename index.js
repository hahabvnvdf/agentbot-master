const { ShardingManager } = require('discord.js');
require("dotenv").config();
const { TOKEN, TOPGG, DBOTGG } = process.env;
const db = require('quick.db');
const AutoPoster = require('topgg-autoposter');
const manager = new ShardingManager('./bot.js', {
    totalShards: 'auto',
    token: TOKEN,
});

const poster = AutoPoster(TOPGG, manager);

poster.on('posted', () => {
    console.log('Posted stats to top.gg');
});

manager.on('shardCreate', (shard) => console.log(`Shard ${shard.id} đã được spawn!`));

manager.spawn();

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
