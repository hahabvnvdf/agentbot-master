const axios = require('axios');
const url = "https://hasteb.in/documents";
module.exports = {
    post: async function(content) {
        try {
            const res = await axios.post(url, content);
            return `https://hasteb.in/${res.data.key}`;
        }
        catch (e) {
            return { error: true, message: e.message };
        }
    },
};