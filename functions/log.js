const logdna = require('@logdna/logger');
const options = {
    app: 'AgentBot',
    level: process.env.TYPE_RUN == "production" ? "TRACE" : "DEBUG",
};
const logger = logdna.createLogger(process.env.LOGDNA, options);
module.exports = {
    log: function(text) {
        logger.log(text);
    },
    logErr: function(text) {
        logger.error(text);
    },
};