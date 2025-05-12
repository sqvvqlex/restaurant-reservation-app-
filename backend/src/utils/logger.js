const logger = {
    info: (...args) => {
        console.log('\x1b[36m%s\x1b[0m', '[INFO]', ...args);
    },
    error: (...args) => {
        console.error('\x1b[31m%s\x1b[0m', '[ERROR]', ...args);
    },
    warn: (...args) => {
        console.warn('\x1b[33m%s\x1b[0m', '[WARN]', ...args);
    },
    debug: (...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug('\x1b[32m%s\x1b[0m', '[DEBUG]', ...args);
        }
    }
};

module.exports = {
    logger
};
