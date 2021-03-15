const { ShardingManager } = require('discord.js');
require("dotenv").config();
const { TOKEN, TOPGG } = process.env;
const db = require('quick.db');
const AutoPoster = require('topgg-autoposter');
const manager = new ShardingManager('./bot.js', {
    totalShards: 'auto',
    token: TOKEN,
    execArgv: ['--trace-warnings'],
});
const poster = AutoPoster(TOPGG, manager);

poster.on('posted', () => {
    console.log('Posted stats to top.gg');
});

manager.spawn().then(() => console.log('All shard is done!'));

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
