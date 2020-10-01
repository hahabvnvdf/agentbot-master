const { ownerID } = require('../../config.json');
const { inspect } = require('util');
const { post } = require('../../functions/post');
module.exports = {
        name: "eval",
        aliases: ["e"],
        description: "Execute javascript code",
        usage: "<PREFIX>eval <js code>",
        run: async (client, message, args) => {
            if (message.author.id == ownerID) {
                if (!args[0]) return message.reply('Nhập lệnh để chạy code...');
                try {
                    const start = process.hrtime();
                    let output = eval(args.join(' '));
                    const difference = process.hrtime(start);
                    if (typeof output !== "string") output = inspect(output, { depth: 2 });
                    return message.channel.send(`*Lệnh đã chạy xong trong ${difference[0] > 0 ? `${difference[0]}s ` : ""}${difference[1] / 1e6}ms*\n\`\`\`js\n${output.length > 1950 ? await post(output) : output}\n\`\`\``);
                }
                catch(err) {
                    return message.channel.send(`Error:\n\`${err}\``);
                }
            } else return message.channel.send("Lệnh này chỉ dành cho owner của bot.");
    },
};