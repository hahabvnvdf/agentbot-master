const { MessageEmbed } = require('discord.js');
const axios = require('axios');
module.exports = {
    getMember: async function(message, toFind = '', authorReturn = true) {
        if (!toFind) return authorReturn ? message.member : null;
        toFind = toFind.toLowerCase();
        let target = await message.guild.members.fetch({ user: toFind }).catch(() => undefined);
        if (!target && message.mentions.members) target = message.mentions.members.first();
        if (!target && toFind) {
            target = await message.guild.members.fetch({ query: toFind, limit: 1 });
            target = target[0];
        }
        if (!target) target = authorReturn ? message.member : null;
        return target;
    },

    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-US').format(date);
    },

    promptMessage: async function(message, author, time, validReactions) {
        // We put in the time as seconds, with this it's being transfered to MS
        time *= 1000;

        // For every emoji in the function parameters, react in the good order.
        for (const reaction of validReactions) await message.react(reaction);

        // Only allow reactions from the author,
        // and the emoji must be in the array we provided.
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        // And ofcourse, await the reactions
        return message
            .awaitReactions(filter, { max: 1, time: time })
            .then(collected => collected.first() && collected.first().emoji.name);
    },

    pages: function(arr, itemsPerPage, page = 1) {
        const maxPages = Math.ceil(arr.length / itemsPerPage);
        if (page < 1 || page > maxPages) return null;
        return arr.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    },

    sleep: async function(miliseconds) {
        const start = new Date().getTime();
        for (let i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > miliseconds) {
                break;
            }
        }
    },
    laysodep: function(num) {
        const pattern = /\B(?=(\d{3})+(?!\d))/g;
        return num.toString().replace(pattern, ',');
    },
    checkemptyobject: function(obj) {
        if (!obj) return true;
        for (const key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },
    trimArray: function(arr, maxLen) {
        if (arr.length > maxLen) {
            const len = arr.length - maxLen;
            arr = arr.slice(0, maxLen);
            arr.push(`${len} more....`);
        }
        return arr;
    },
    formatBytes: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    },
    getIDs: function(cache) {
        let result = "";
        cache.forEach(function(ele, key, map) {
            result += "money_" + key + ",";
        });
        return result.slice(0, -1);
    },
    getunplash: async function(query) {
        if (!query) throw new Error('Query is empty!');
        const unsplashapikey = process.env.UNSPLASH;
        try {
            const response = await axios.get(`https://api.unsplash.com/photos/random/`, {
                headers: { "Authorization": `Client-ID ${unsplashapikey}` },
                params: { query: query, count: 1 },
            });
            const json = response.data[0];
            const embed = new MessageEmbed()
                .setTitle('Click vào để download')
                .setURL(json.links.download)
                .setImage(json.urls.small)
                .setFooter(`Photo by ${json.user.name} at unsplash.com`);
            return embed;
        }
        catch(e) {
            return null;
        }
    },
    capitalizeWords: function(string) {
        return string.replace(/(?!^[0-9])(^|[^a-zA-Z\u00C0-\u017F\u0400-\u04FF'])([a-zA-Z\u00C0-\u017F\u0400-\u04FF])/g, function(m) {
            return m.toUpperCase();
        });
    },
};