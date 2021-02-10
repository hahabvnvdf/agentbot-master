const db = require('quick.db');
const allDb = db.all();

for (let i = 0; i < allDb.length; i++) {
    const guild = allDb[i].ID;
    try {
        if (!db.has(`${guild.ID}.rankChannel`)) db.set(`${guild.ID}.rankChannel`, false);
    } catch(e) {
        console.log(e);
        continue;
    }

}

console.log('Applied new database!');