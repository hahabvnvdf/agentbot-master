const random = require('random-number-csprng');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const jimp = require('jimp');
module.exports = {
    getMember: function(message, toFind = '') {
        toFind = toFind.toLowerCase();
        let target = message.guild.members.cache.get(toFind);
        if (!target && message.mentions.members)
            target = message.mentions.members.first();
        if (!target && toFind) {
            target = message.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                    member.user.tag.toLowerCase().includes(toFind);
            });
        }
        if (!target)
            target = message.member;
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

    sleep: function(miliseconds) {
        const start = new Date().getTime();
        for (let i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > miliseconds) {
                break;
            }
        }
    },
    randomcard: async function(listofcard) {
        if (!Array.isArray(listofcard)) return null;
        const num = await random(0, listofcard.length - 1);
        const cards = listofcard[num];
        return cards;
    },
    checkautowin: function(list) {
        let aces = 0;
        let jqk = 0;
        if (list.length !== 2) return { check: false, data: { aces: aces, jqk: jqk } };
        for (let i = 0; i < list.length; i++) {
            if (!isNaN(list[i].slice(2, 3)) && list[i].slice(2, 3) !== '1') continue;
            else if (list[i].slice(2, 3).toLowerCase() == 'a') aces++;
                else if (list[i].slice(2, 3).toLowerCase() == 'j' || list[i].slice(2, 3).toLowerCase() == 'q' || list[i].slice(2, 3).toLowerCase() == 'k' || list[i].slice(2, 3) == '1') jqk++;
        }
        if (aces == 1 && jqk == 1) return { check: true, loaiwin: "xidach", data: { aces: aces, jqk: jqk } };
        else if (aces == 2) return { check: true, loaiwin: "xibang", data: { aces: aces, jqk: jqk } };
        else return { check: false, data: { aces: aces, jqk: jqk } };
    },
    getcardvalue: function(list) {
        let point = 0;
        let aces = 0;
        for (let i = 0; i < list.length; i++) {
            const cardname = list[i].slice(2, 3);
            if (!isNaN(cardname)) {
                switch(parseInt(cardname)) {
                    case 1:
                        point = point + 10;
                        break;
                    default:
                        point = point + parseInt(cardname);
                        break;
                }
            } else {
                switch(cardname) {
                    case "a":
                        aces++;
                        break;
                    default:
                        point = point + 10;
                        break;
                }
            }
        }
        if (aces == 0) return point.toString();
        else {
            for (let y = 0; y < aces; y++) {
                if (point > 10) point++;
                else point = point + 11;
            }
            return `${point}*`;
        }
    },
    createembed: function(nguoichoi, bet, deck_user, deck_bot, nguoichoi_val, bot_val, hidden_deck, end) {
        const embed = new MessageEmbed()
            .setColor("#00FFFF")
            .setFooter('Game đang diễn ra')
            .setAuthor(`${nguoichoi.tag}, bạn đã cược ${bet} để chơi xì dách!`, nguoichoi.displayAvatarURL())
            .setFooter("Đang chơi!");
        if (end == 'thang') {
            embed.setColor("#90EE90");
            embed.footer.text = `Bạn thắng ${bet} tiền!`;
            embed.addFields(
                { name: `Bot: [${bot_val}]`, value: deck_bot },
                { name: `User: [${nguoichoi_val}]`, value: deck_user },
            );
        } else if (end == 'thua') {
            embed.setColor("#FF0000");
            embed.footer.text = `Bạn thua ${bet} tiền!`;
            embed.addFields(
                { name: `Bot: [${bot_val}]`, value: deck_bot },
                { name: `User: [${nguoichoi_val}]`, value: deck_user },
            );
        } else if (end == 'hoa') {
            embed.setColor("#D3D3D3");
            embed.footer.text = `Bạn không mất tiền cho trận đấu này`;
            embed.addFields(
                { name: `Bot: [${bot_val}]`, value: deck_bot },
                { name: `User: [${nguoichoi_val}]`, value: deck_user },
            );
        } else if (end == 'thangx2') {
            embed.setColor("#90EE90");
            embed.footer.text = `Bạn thắng ${parseInt(bet.replace(',', '')) * 2} tiền!`;
            embed.addFields(
                { name: `Bot: [${bot_val}]`, value: deck_bot },
                { name: `User: [${nguoichoi_val}]`, value: deck_user },
            );
        } else if (end == 'not') {
            embed.addFields(
                { name: `Bot: [?]`, value: hidden_deck },
                { name: `User: [${nguoichoi_val}]`, value: deck_user },
            );
        }
        return embed;
    }, laysodep: function(num) {
        const pattern = /\B(?=(\d{3})+(?!\d))/g;
        return num.toString().replace(pattern, ',');
    }, createembedfield: function(deck) {
        if (!Array.isArray(deck)) return null;
        let line = "";
        deck.forEach(card => {
            line += card;
        });
        return line;
    },
    locbai : function(listOfCard, deck) {
        if (!Array.isArray(listOfCard) || !Array.isArray(deck)) return null;
        return listOfCard.filter(item => !deck.includes(item));
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
    circle: async function(image) {
        if (!image) throw new Error('image was not provided!');
        image = await jimp.read(image);
        image.resize(1024, 1024);
        image.circle();
        const raw = await image.getBufferAsync('image/png');
        return raw;
    },
    toAbbrev: function(num) {
        if (!num) return 'NaN';
        if (typeof num === 'string') num = parseInt(num);
        const decPlaces = Math.pow(10, 1);
        const abbrev = ['K', 'M', 'B', 'T'];
        for (let i = abbrev.length - 1; i >= 0; i--) {
            const size = Math.pow(10, (i + 1) * 3);
            if (size <= num) {
                num = Math.round((num * decPlaces) / size) / decPlaces;
                if (num == 1000 && i < abbrev.length - 1) {
                    num = 1;
                    i++;
                }
                num += abbrev[i];
                break;
            }
        }
        return num;
    },
    capitalizeWords: function(string) {
        return string.replace(/(?!^[0-9])(^|[^a-zA-Z\u00C0-\u017F\u0400-\u04FF'])([a-zA-Z\u00C0-\u017F\u0400-\u04FF])/g, function(m) {
            return m.toUpperCase();
        });
    },
};