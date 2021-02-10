const db = require('quick.db');
const allDb = db.all();
allDb.forEach(guild => {
    db.set(`${guild.ID}.botdangnoi`, false);
    if (!db.has(`${guild.ID}.rankChannel`)) db.set(`${guild.ID}.rankChannel`, false);
});
console.log('Applied new database!');