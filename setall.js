const db = require('quick.db');

async function main() {
    const all = await db.fetchAll();
    for (let i = 0; i < all.length - 1; i++) {
        const key = all[i].ID;
        await db.set(`${key}.noitu`, null);
        await db.set(`${key}.noituStart`, false);
        await db.set(`${key}.noituArray`, []);
        await db.set(`${key}.maxWords`, 1500);

    }
    console.log('done');
}

main();