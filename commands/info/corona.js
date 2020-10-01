const { MessageEmbed } = require("discord.js");
const api = require('novelcovid');
api.settings({ baseUrl: 'https://disease.sh' });
const { laysodep, capitalizeWords } = require('../../functions/utils');
const usaState = require('../../assets/json/usastate.json');
module.exports = {
    name: "corona",
    category: "info",
    description: "Thông tin về coronavirus",
    usage: "<PREFIX>corona hoặc <PREFIX>corona <tên quốc gia>",
    note: "Tìm kiếm bang và quận của mỹ, lệnh là `<PREFIX>corona usprovince <province_name,state_code>` và `<PREFIX>corona usstate <state_name>`",
    example: "<PREFIX>corona usstate texas hoặc <PREFIX>corona usprovince dallas,tx",
    run: async (client, message, args) => {
        if (!args[0]) {
            const data = await api.all();
            const d = new Date(data.updated);
            const fulldate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const embed = new MessageEmbed()
                .setAuthor('Dữ liệu tự động cập nhật')
                .setTitle(`Số ca nhiễm COVID-19 ở Thế Giới`)
                .addField('Số ca nhiễm: ', `${laysodep(data.cases)}(+${laysodep(data.todayCases)})`, true)
                .addField('Số ca tử vong: ', `${laysodep(data.deaths)}(+${laysodep(data.todayDeaths)})`, true)
                .addField('Số ca nghiêm trọng: ', laysodep(data.critical), true)
                .addField('Số ca hồi phục: ', laysodep(data.recovered), true)
                .addField('Số quốc gia bị nhiễm: ', data.affectedCountries, true)
                .addField('Ngày cập nhật: ', fulldate, true)
                .setFooter('Nguồn: worldometers.info');
            message.channel.send(embed);
        } else if (args[0] == 'usstate') {
            if (!args[1]) return message.channel.send('Vui lòng nhập tên bang!');
            const statename = args.splice(1).join(' ');
            const data = await api.states({ state: statename });
            if (data.message) return message.channel.send('Không tìm thấy bang mà bạn yêu cầu');
            const embed = new MessageEmbed()
                .setAuthor(`Thông tin về COVID-19 ở bang ${data.state}`)
                .addField('Tất cả ca nhiễm: ', `${laysodep(data.cases)}(+${laysodep(data.todayCases)})`, true)
                .addField('Số ca tử vong: ', `${laysodep(data.deaths)}(+${laysodep(data.todayDeaths)})`, true)
                .addField('Số ca đã thử virus: ', laysodep(data.tests), true)
                .addField('Số ca nhiễm hiện tại: ', laysodep(data.active), true)
                .setFooter('Nguồn: worldometers.info');
            message.channel.send(embed);
        } else if (args[0] == 'usprovince') {
            if (!args[1]) return message.channel.send('Vui lòng nhập tên quận!');
            const query = args.splice(1).join(' ');
            if (!query.includes(',')) return message.channel.send('Vui lòng nhập tên bang cách tên quận bằng dấu phẩy(,)! (VD: Dallas,tx)');
            const arr_query = query.split(',');
            if (!arr_query[1]) return message.channel.send("Vui lòng nhập tên bang hoặc mã bang!");
            const province_name = arr_query[0].toLowerCase();
            let state = arr_query[1];
            if (state.length == 2) {
                state = state.trim().toUpperCase();
                let dataf = usaState.filter(e => e.abbreviation == state);
                dataf = dataf[0];
                state = dataf.name;
            }
            state = capitalizeWords(state.trim());
            let data = await api.jhucsse.counties({ county: province_name });
            data = data.filter(e => e.province == state);
            data = data[0];
            const d = new Date(data.updatedAt);
            const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const embed = new MessageEmbed()
                .setAuthor(`Thông tin về COVID-19 ở quận ${data.county},${data.province}`)
                .addField('Số ca nhiễm: ', laysodep(data.stats.confirmed), true)
                .addField('Số ca tử vong: ', laysodep(data.stats.deaths), true)
                .addField('Số ca hồi phục: ', laysodep(data.stats.recovered), true)
                .addField('Ngày cập nhật: ', date, true)
                .setFooter('Source: John Hopkins University');
            message.channel.send(embed);
        } else {
            const data = await api.countries({ country: args.join(' ') });
            const d = new Date(data.updated);
            const fulldate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const embed = new MessageEmbed()
                .setAuthor(`Thông tin về COVID-19 ở ${data.country}`)
                .setThumbnail(data.countryInfo.flag)
                .addField('Số ca nhiễm: ', `${laysodep(data.cases)}(+${laysodep(data.todayCases)})`, true)
                .addField('Số ca tử vong: ', `${laysodep(data.deaths)}(+${laysodep(data.todayDeaths)})`, true)
                .addField('Số ca nghiêm trọng: ', laysodep(data.critical), true)
                .addField('Số ca hồi phục: ', laysodep(data.recovered), true)
                .addField('Ngày cập nhật: ', fulldate, true)
                .setFooter('Nguồn: worldometers.info');
            message.channel.send(embed);
        }
    },
};