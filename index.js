const { ShardingManager } = require('discord.js');
require("dotenv").config({
    path: __dirname + '/.env',
});
const manager = new ShardingManager('./bot.js', {
    totalShards: 'auto',
    token: process.env.TOKEN,
});

manager.on('shardCreate', (shard) => console.log(`Shard ${shard.id} đã được spawn!`));

manager.spawn();